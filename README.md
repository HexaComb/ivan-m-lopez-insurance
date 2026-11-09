# Ivan M. Lopez Insurance

Initial bilingual website for independent insurance broker Ivan M. Lopez. A responsive, senior-friendly static site with Medicare-first service information, the supplied headshot, call/text links, accessible FAQs, and English/Spanish pages.

## Develop and verify

Requires Node.js 22+ and Python 3 for the optional local server. No npm dependencies.

```
npm run check
npm run dev
```

Open http://localhost:4173. English is `/`; Spanish is `/es/`. Run `npm run build` after changes. Source content lives in `scripts/build.mjs`; presentation in `public/styles.css`. Build output is `dist/`.

## Contact and privacy

The site does not collect or store visitor information. Callback/appointment requests go through the displayed call or text links. There is deliberately no fake success message or unconnected lead form. No analytics, tracking cookies, externally hosted fonts, or third-party scripts are included.

The supplied form-consent wording is preserved as the exported `consent` constant for future integration. Before adding a form, approve its purpose, secure destination, privacy policy and retention rules, implement consent, and test actual delivery. Do not collect medical details or Medicare identifiers in a general lead form.

## Review before launch

- Client review of all marketing copy and Spanish translations, including disclosures. The supplied English Medicare disclosure and independent-broker statement remain on both language pages.
- Confirm current required Medicare wording with the client's compliance reviewer. Inclusion of supplied wording is not legal approval.
- Add the supplied VB logo once a usable original is available. The Gmail attachment download failed; no substitute logo has been invented.
- Confirm domain, office time zone, and any additional state-license display requirements. No domain has been purchased or implied.
- Review photo/brand publication permissions as part of client sign-off.
- Remove `noindex,nofollow` from HTML, `X-Robots-Tag` from `_headers`, and the disallow rule in `robots.txt` only after launch approval.

## CI and Cloudflare

GitHub Actions validates both pages and saves the static build as an artifact. It does not deploy or create credentials.

Recommended Cloudflare Pages Git integration: select this repository and production branch; build command `npm run check`; output directory `dist`; Node.js version 22. Git integration authorization or credential creation must be approved before setup. The website needs no runtime secrets. Do not commit Cloudflare tokens or client correspondence.

The original website is already deployed in production. The creative-coverage-guide branch contains a separate redesign for preview and review only; these local changes do not authorize or claim a production deployment.

## Creative coverage guide (local redesign)

The editorial direction uses a paper portrait, restrained green/cream palette, bespoke insurance illustrations, and a question-led field guide. It draws on the user’s AAC interactive color lab, Ruiz trade-specific storytelling, and Unreelviews editorial restraint without copying their trade imagery. There are no decorative sequential numbers, gradients, invented logos, or stock-client claims.

`public/guide.js` progressively enhances four server-rendered guide topics. Visitors can choose a starting point, add/remove questions across topics, clear the list, and print their questions. The notes are in memory for this page only: no cookies, local storage, requests, submissions, or personal-data fields. Reloading or changing language resets the list. With JavaScript disabled, every topic and question remains visible; optional interactive controls are hidden. The language switch uses separate static pages.

The content security policy allows first-party scripts only. Reduced-motion visitors receive no transition animation. All guide controls are native buttons with pressed states and visible focus, and question counts are announced politely. `tests/guide.test.mjs` covers selection, repeated/invalid topic changes, bilingual content parity, reset/print wiring, disclosure preservation, and privacy/presentation guards. Browser visual, responsive, keyboard, and print-preview review remains a separate verification step.

No publishing or deployment is part of this local redesign. Existing client/compliance/translation review requirements above still apply.

Printed conversation notes include the exact supplied English Medicare and independent-broker disclosures; Spanish prints also retain the Spanish disclosure translation. Branding and social links are omitted from print.
