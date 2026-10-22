# Cally

Chrome extension that creates editable coin explanations from public websites, X posts and relevant tweet images. On Pump.fun and Terminal charts it shows a movable panel and an attributed LarpCheck verdict when available. Users review and post drafts themselves. Cally does not trade or submit callouts.

## Public release

Website and backend: https://cally.pro (Render, with domain DNS managed at Hostinger).
Download: https://cally.pro/downloads/cally.zip
Privacy: https://cally.pro/privacy
Support: yournos462@gmail.com

The ZIP is installed manually using Chrome Developer mode and Load unpacked. Keep its extracted folder. First-run consent is required before hosted source processing. This is not a Chrome Web Store release; updates require replacing the extracted files and reloading the extension.

## Local development

Use Node.js 24. Run npm ci, copy .env.example to .env, and set OPENAI_API_KEY and CALLY_EXTENSION_ID. Load extension/ unpacked, then npm start. The development extension uses http://127.0.0.1:4317. Never commit .env or API keys.

Run node --test test/*.test.mjs for the canonical tests. Coverage includes source URL validation, nested tweet context, image filtering, chart routing, LarpCheck contract matching, panel movement and durable daily quotas.

## Hosted deployment

Dockerfile serves the backend and public/ on PORT. Render uses one instance with a persistent disk mounted at /var/data. Set CALLY_HOSTED=true, CALLY_USAGE_DB=/var/data/usage.sqlite, OPENAI_API_KEY as a secret, OPENAI_MODEL=gpt-4.1-mini, and CALLY_EXTENSION_ID=pkiggoghgipigopnekllkkncobcnlppa. Enable CALLY_GENERATION_ENABLED and CALLY_DOWNLOAD_ENABLED only after configuration and package validation. The template starts generation disabled.

Current allowances are CALLY_GLOBAL_DAILY=100 and CALLY_INSTALLATION_DAILY=20 attempts per UTC day, including failed attempts. Installation IDs can be reset; they are not authenticated accounts. The durable global cap limits aggregate attempts. Origin checks are not authentication. Provider billing is separate.

## Rebuild release

Set CALLY_PUBLIC_API_URL=https://cally.pro and run node scripts/stage-store.mjs. ZIP the contents of its output directory so manifest.json is at the archive root; place the ZIP at public/cally.zip. The staging script adds the public key in scripts/release-identity.json for a stable extension ID, switches the API origin to HTTPS and includes onboarding. No private signing key or API key belongs in the archive.

## Source limitations

Public X conversation data and public website HTML can be incomplete or blocked. The extension reports unavailable sources instead of inventing ratings. It reads bounded nested posts and relevant photo attachments; it does not interpret videos. LarpCheck lookup only reads existing public reports and never starts paid checks. AI wording varies without guaranteeing global uniqueness or factual accuracy; review drafts before posting.
