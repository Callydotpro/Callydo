import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
// Single-instance durable quotas. The global cap remains effective if clients reset IDs.
export class UsageLimits {
 constructor(filename,{globalDaily=100,installationDaily=20}={}) {
  for(const limit of [globalDaily,installationDaily])if(!Number.isInteger(limit)||limit<1)throw Error('Usage limits must be positive integers.');
  this.globalDaily=globalDaily;this.installationDaily=installationDaily;
  this.db=new DatabaseSync(filename);
  this.db.exec('CREATE TABLE IF NOT EXISTS usage (day TEXT NOT NULL, client TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(day,client))');
 }
 reserve(writerId,now=new Date()) {
  if(typeof writerId!=='string'||writerId.length<16||writerId.length>100)return {ok:false,error:'Reopen Cally to initialize this installation.'};
  const day=now.toISOString().slice(0,10),client=createHash('sha256').update(day+writerId).digest('hex');
  this.db.exec('BEGIN IMMEDIATE');
  try {
   const read=this.db.prepare('SELECT count FROM usage WHERE day=? AND client=?');
   const total=read.get(day,'global')?.count || 0,used=read.get(day,client)?.count || 0;
   if(total>=this.globalDaily || used>=this.installationDaily){this.db.exec('ROLLBACK');return {ok:false,error:total>=this.globalDaily?'Cally has reached its daily service allowance. Try again tomorrow.':'This installation has reached its daily allowance. Try again tomorrow.'};}
   const increment=this.db.prepare('INSERT INTO usage(day,client,count) VALUES(?,?,1) ON CONFLICT(day,client) DO UPDATE SET count=count+1');
   increment.run(day,'global');increment.run(day,client);
   this.db.prepare('DELETE FROM usage WHERE day < ?').run(new Date(now.getTime()-7*86400000).toISOString().slice(0,10));
   this.db.exec('COMMIT');return {ok:true};
  } catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 close(){this.db.close();}
}
