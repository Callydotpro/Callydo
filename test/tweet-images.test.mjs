import test from 'node:test';
import assert from 'node:assert/strict';
import {collectTweetImages,tweetImageURL} from '../tweet-images.mjs';
import {readTweet} from '../sources.mjs';
import {buildRequest} from '../generation.mjs';
test('only tweet photo attachments are accepted, deduplicated and bounded',()=>{
 const images=[];
 collectTweetImages({id_str:'1',user:{screen_name:'author'},mediaDetails:[{type:'video',media_url_https:'https://pbs.twimg.com/media/video.jpg'},{type:'photo',media_url_https:'https://pbs.twimg.com/media/coin.png'}],photos:[{url:'https://pbs.twimg.com/media/coin.png'},...Array.from({length:6},(_,i)=>({url:`https://pbs.twimg.com/media/p${i}.jpg`}))]},images);
 assert.equal(images.length,4);assert.equal(images[0].postId,'1');assert.ok(!images.some(i=>i.url.includes('video')));
 for(const url of ['http://pbs.twimg.com/media/a.png','https://evil.com/a.png','https://pbs.twimg.com/profile_images/a.png','https://user:pass@pbs.twimg.com/media/a.png']) assert.equal(tweetImageURL(url),null);
});
test('nested quote photos retain the originating post and become vision inputs',async()=>{
 const images=[];
 await readTweet('2','https://x.com/a/status/2',async url=>JSON.stringify(new URL(url).searchParams.get('id')==='2'?{id_str:'2',text:'This quotes a useful image',quoted_tweet:{id_str:'1',text:'Original'}}:{id_str:'1',text:'Original',user:{screen_name:'original'},photos:[{url:'https://pbs.twimg.com/media/coin.png'}]}),images);
 assert.equal(images.length,1);assert.equal(images[0].postId,'1');
 const request=buildRequest({text:'The quoted post explains the image and its context.',images},'test');
 const content=request.input[0].content;
 assert.equal(content[2].type,'input_image');assert.equal(content[2].detail,'high');assert.equal(JSON.parse(content[1].text).attachmentOfPost,'1');
});
