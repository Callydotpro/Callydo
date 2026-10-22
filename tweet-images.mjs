// Only public tweet attachments, never profile pictures or arbitrary remote URLs.
export function tweetImageURL(value) {
  try {
    const url=new URL(value);
    if(url.protocol!=='https:' || url.hostname!=='pbs.twimg.com' || url.port || url.username || url.password || !/^\/media\/[\w-]+\.(png|jpe?g|webp)$/i.test(url.pathname)) return null;
    url.search='';url.hash='';return url.href;
  } catch {return null;}
}
export function collectTweetImages(tweet, images) {
  const candidates=[...(tweet.mediaDetails || []).filter(m=>m.type==='photo').map(m=>m.media_url_https),...(tweet.photos || []).map(m=>m.url)];
  for(const candidate of candidates) {
    const url=tweetImageURL(candidate);
    if(url && images.length<4 && !images.some(image=>image.url===url)) images.push({url,postId:tweet.id_str,author:String(tweet.user?.screen_name || '').slice(0,100)});
  }
}
