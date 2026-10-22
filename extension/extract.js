// Self-contained: Chrome serializes this function into the active page.
export function extractPage() {
  const clean = value => (value || '').replace(/\s+/g, ' ').trim();
  const selection = clean(window.getSelection()?.toString());
  const url = new URL(location.href);
  url.search = ''; url.hash = '';
  let text = selection;
  let kind = selection ? 'Selected text' : 'Website';
  if (!text && /(^|\.)(x\.com|twitter\.com)$/.test(location.hostname)) {
    const id = location.pathname.match(/\/status\/(\d+)/)?.[1];
    if (!id) throw new Error('Open a specific tweet, or select the text you want to use.');
    const article = [...document.querySelectorAll('article')].find(node =>
      [...node.querySelectorAll('a[href]')].some(a => a.querySelector('time') && new URL(a.href).pathname.endsWith('/status/' + id)));
    if (!article) throw new Error('Tweet is not loaded yet. Wait for it to appear and reopen Cally.');
    text = [...article.querySelectorAll('[data-testid="tweetText"]')].map(n => n.innerText).join('\n');
    kind = 'Tweet';
    return {title:document.title.slice(0,300),url:url.href,text:clean(text).slice(0,14000),kind,links:[url.href]};
  }
  if (!text && kind === 'Website') {
    const root = document.querySelector('main') || document.querySelector('article') || document.body;
    const copy = root.cloneNode(true);
    copy.querySelectorAll('script,style,noscript,nav,footer,header,aside,form,input,textarea,select,button,[contenteditable],[hidden],[aria-hidden="true"]').forEach(n => n.remove());
    text = copy.textContent;
  }
  text = clean(text).slice(0, 14000);
  if (text.length < 30) throw new Error('Not enough readable text. Select a useful passage, or paste source text below.');
  return {title: document.title.slice(0, 300), url: url.href, text, kind};
}
