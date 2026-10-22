# Cally

Chrome extension for writing pump.fun callouts from the current website, selected text, or an individual X post.

## Setup

1. Load `extension/` using Load unpacked in Chrome's extension manager.
2. Copy `.env.example` to `.env`, add your API key locally, and set CALLY_EXTENSION_ID to the installed extension ID.
3. Run `npm start` with Node.js 22+.
4. Open a website or individual tweet and click Cally. Generation starts automatically. Edit and copy the result, or choose New version.

After updating, reload Cally in chrome://extensions. Version 0.2 removes the old background-navigation feature and uses opening the popup as the trigger. No form or generation button is needed. On unreadable pages, a paste-text fallback appears.

## Data and variation

Opening Cally sends extracted text and the title to OpenAI through a local backend. Each installation has a random local writer ID. Fresh variation instructions change the angle and sentence structure on every request. New version also passes the previous draft to discourage repetition. This promotes variety but does not guarantee global uniqueness; no shared draft registry exists.

The key stays in the local backend, which accepts the configured extension origin. Response storage is disabled. Generated text remains editable. Cally does not submit callouts, monitor buys, or interpret images/videos. Extraction reads loaded page text only. Live website changes may require extractor updates. Generation normally takes several seconds; it is automatic, not zero-latency.

## Verification

Run `npm test`. Input validation, source/prompt separation, variation and response parsing are tested. Two live sample generations succeeded with different text. Chrome popup rendering after the update still requires verification in the installed extension.

References: [Chrome scripting](https://developer.chrome.com/docs/extensions/reference/api/scripting), [OpenAI text generation](https://developers.openai.com/api/docs/guides/text).

## Version 0.3: chart companion

On pump.fun coin pages Cally now appears automatically as a small minimizable panel. It reads the coin-header X or website badge, fetches up to two linked public sources through the backend, and writes a draft. Copy callout and New version stay on-chart. No callout is submitted and no wallet action is performed. Reload the extension and refresh existing pump.fun tabs after updating.

Public individual tweets use X's public embed endpoint; text may be truncated by X. Profiles, communities, private/deleted posts and image/video-only posts may be unreadable. Websites use public HTML, not a full browser renderer. Blocked sources are reported; if no source can be read, Cally does not generate from the trading feed. Source requests reject private addresses, validate redirects and pin the resolved public IP. The panel lists sources actually read.

Drafts are cached per coin in browser session memory for ten minutes. New version bypasses that cache. Coin navigation clears the prior panel and ignores stale generation results. The live PHP2SHELL example successfully produced an on-chart draft from its linked tweet; website extraction was separately tested with example.com.

## Version 0.4: LarpCheck badge

A badge beside the coin heading displays LarpCheck's existing narrative verdict, attributed to LarpCheck. Hover for the source summary and check age; click for its report. Holder-risk verdicts are separate and are not treated as the narrative score. Exact contract addresses are matched, including hex addresses; unsupported or unreadable pages show Unavailable, never an invented rating.

Cally briefly opens an inactive Chrome tab at larpcheck.app/<contract>, reads the public latest-coin verdict, and closes its tab unless the user activates or navigates it. It never starts a new check, unlocks reports, spends credits, or bypasses access challenges. Results are cached in session memory for five minutes. This integration requires Chrome site access to larpcheck.app and depends on its public page layout. Reload the updated extension and refresh existing pump.fun tabs.

## Version 0.5: automatic direct ratings

Replaces the browser-tab reader with LarpCheck's public GET /api/ca/<contract> lookup, discovered in its own frontend. No LarpCheck tab is opened or required. The response must match the contract and the latest completed coin check; the narrative verdict is displayed separately from holder-risk stamps. Public requests omit credentials and never start or unlock checks. Successful results are cached for five minutes; unavailable responses retry after a minute. Coins without a completed recognized verdict show Not checked. No rating is invented.

### 0.5.1 — Tweet conversation context
Cally reads public X embed data including quoted originals and available parent posts, with separate author labels. It falls back to the linked post if context cannot be retrieved and never guesses hidden content. Chart caches use a new version key. Reload the extension once after updating; the backend must also be restarted.


Nested tweet context: the backend now fetches up to five unique quoted, parent, or directly linked X posts, including quotes missing from embedded snippets. Lookups have a 20-second overall budget and retain available text if a deeper post is unavailable.


Tweet image reading: up to four public photo attachments across the five-post conversation are sent to OpenAI with their original post and author labels. Images use high detail. Profile pictures and video playback are excluded; unreadable details must not be guessed. This uses image input tokens in addition to text. Click New version to regenerate an existing draft with images.


### 0.6.0 — Terminal and movable panel
Supports Solana charts at trade.padre.gg. Terminal's pair route is tracked separately from the token contract in its header. Drag the Cally header to reposition the panel; its position is saved and kept in the viewport. The arrow button opens a separate Cally window that follows its source chart tab and can be moved to another monitor. Closing or navigating away from that chart disconnects the pop-out until a supported chart is open again. Reload Cally and refresh existing chart tabs after updating.

