import test from 'node:test';
import assert from 'node:assert/strict';
import {publicAddress,validateURL,websiteText,resolveSources} from '../sources.mjs';
test('rejects internal and mapped private addresses',()=>{
 for(const ip of ['127.0.0.1','10.1.2.3','192.168.1.2','169.254.169.254','::1','::ffff:127.0.0.1','fc00::1']) assert.equal(publicAddress(ip),false,ip);
 assert.equal(publicAddress('8.8.8.8'),true);
});
test('rejects unsafe source URLs',()=>{for(const url of ['file:///etc/passwd','https://user:pass@example.com','https://example.com:4317'])assert.throws(()=>validateURL(url));});
test('extracts article text without forms or scripts',()=>{assert.equal(websiteText('<main>Hello &amp; welcome<script>bad()</script><form>secret</form><nav>Menu</nav></main>'),'Hello & welcome');});
test('does not fabricate a source when links are missing',async()=>{await assert.rejects(resolveSources([]),/No coin/);});
