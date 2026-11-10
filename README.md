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

The supplied form-consent wording is preserved as the exported `consent` constant for future integration. Before activating the disabled preview fields, approve its purpose, secure destination, privacy policy and retention rules, implement consent, and test actual delivery. Do not collect medical details or Medicare identifiers in a general lead form.

## Review before launch

- Client review of all marketing copy and Spanish translations, including disclosures. The supplied English Medicare disclosure and independent-broker statement remain on both language pages.
- Confirm current required Medicare wording with the client's compliance reviewer. Inclusion of supplied wording is not legal approval.
- The supplied original Van Berg Insurance Services logo is included in the footer, unmodified and at its original aspect ratio. Confirm brand usage during client sign-off.
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

## Verified audit additions

The preview includes the original 701×201 Van Berg Insurance Services logo, the secondary front-office line (925) 634-5702, and the supplied LinkedIn and X profiles. Ivan’s primary call/text number remains (925) 684-6712. The About section lists the supplied additional licensing states: Arizona, Hawaii, Nevada, Utah, North Carolina, Texas, and Washington; no additional license numbers or plan-availability claims are inferred.

Mobile navigation is now a compact, labeled Menu button with a softly opening panel. The four section links, language switch, and primary call link remain available in the panel. Desktop navigation stays inline. Without JavaScript, all section and language links remain visible. Domain selection remains pending; no domain registration or new production launch is included.

## Hero stock video

The preview hero uses Alex Moliski’s Pexels forest-path footage (video 28903952), visibly credited and documented in `public/assets/forest-path.LICENSE.txt`. It is illustrative scenery, not Ivan’s office or clients. The original was visually reviewed across the clip; source and Pexels license were verified. A self-hosted 960×540 H.264 clip (~941 KiB, 6.5 seconds, no audio) and ~76 KiB poster avoid third-party playback requests.

`public/hero-video.js` loads no video source until playback is allowed or requested. Mobile (600px and below), reduced-motion, data-saver, and hidden-page visitors start on the still image. A bilingual button supports manual play/pause. Autoplay rejection keeps the poster and allows a manual retry; load failure/timeout retains the still with an accessible status. Leaving the viewport, hiding the page, or enabling reduced motion/data saver pauses playback without auto-resuming. The opaque green text panel protects readability regardless of the frame. No JavaScript leaves a complete still-image hero. Deployment remains preview-only.

The preview uses Van Berg Insurance Services as the leading company branding, per the user’s provisional direction. Ivan remains the named independent advisor in the hero, About section, and footer. This visual hierarchy does not assert ownership, employment status, a legal entity type, or a specific contractual relationship. Those details remain subject to client confirmation.

## Medical-themed coverage illustration and motion

The preview includes an original SVG coverage story connecting doctors/networks, prescription coverage, and costs. The illustration uses a stethoscope, prescription bottle/capsule, and coverage shield, with a brief drawn connecting line. Bilingual focus buttons explain insurance questions, not medical care; the section explicitly distinguishes insurance guidance from medical advice.

`public/coverage-motion.js` progressively enhances this section and selected existing section entrances. All content and artwork are visible without JavaScript. Topic controls have pressed states and a polite announcement area. The illustration draws once in 1.8 seconds; section entrances finish in 650 ms and topic transitions in 350 ms. No decorative effect loops, scroll-jacks, or moves the page. Repeated active-topic clicks do not replay effects. Reduced-motion users get static artwork and immediate content changes; enabling reduced motion cancels active effects. Backgrounding stops effects. IntersectionObserver and Web Animations are optional, with functional fallbacks. No animation dependency, extra network request, or medical-service claim is added. The separate hero video's existing play/pause and reduced-motion behavior remains unchanged.

## Senior-friendly client feedback (current preview)

The current preview supersedes the prior cinematic hero: there is no video, tree poster, or video-loader import in either page. Unused media assets and their provenance remain in the repository only. The hero uses Ivan’s real portrait on white. Surfaces are white, body type is 20px, and smaller labels are at least 16px. The Spanish link reads “Ayuda En Español.” Ivan’s advisory services are prominently described as completely free and without obligation, with an explicit explanation that insurance plans can have premiums and other costs. Walk-ins are welcome; appointment times are confirmed by phone.

A clearly marked, disabled callback/appointment prototype shows the requested name, phone, optional email, Medicare/Part A/Part B choices, and consent. It contains no form element, action, submit control, enabled input, data-collection code, or availability slots. Exact supplied English consent appears on both pages, with a Spanish translation on the Spanish page. Calling remains functional. Do not activate fields until the receiving destination, privacy/retention requirements, availability source, and consent handling are approved and actual delivery is tested. No medical information is collected by this preview.

The brief medical-themed coverage illustration and accessible focus controls remain; reduced-motion and no-JavaScript fallbacks are unchanged. Browser QA should check both languages at mobile sizes and zoom, especially the longer Spanish navigation label. No client email or production update is part of this revision.

## Mobile menu refinement (current preview)

`public/menu.js` progressively enhances the header at 1024px and below. A labeled Menu/Close (Menú/Cerrar) button controls a white navigation panel with generous link targets, the language switch, and Ivan’s primary phone link. Opening has a 240ms fade/10px slide, closing takes 160ms, and the two-line icon becomes a close mark. No decorative numbering or continuous animation is added.

This is a disclosure, not a modal: it keeps normal Tab order, does not lock scrolling, and closes on Escape, outside pointer interaction, a link selection, or focus leaving the header. Closed and closing links are inert and removed from the accessibility tree. Escape returns focus to the button; section selections move focus to their destination. Resizing to desktop removes mobile hidden/inert state. Repeated toggles and changing reduced-motion preferences cancel in-flight animation safely. Reduced-motion users get immediate state changes and no icon transition. No Web Animations support leaves a functional instant menu. The no-JavaScript fallback retains all links.

The client’s static hero, 20px body type, free-service/cost clarification, disabled appointment prototype, disclosures, and existing guide remain unchanged. This requested menu motion is limited to opening and closing. This revision is preview-only and does not merge or change production.

## Always-available language access

At 1024px and below, a static bottom-right language shortcut reads “Ayuda En Español” on the English page and opens the existing Spanish page. The Spanish page provides the equivalent “English” return link. It uses native links without a JavaScript dependency, new contact flow, tracking, or personal-data collection. Safe-area offsets, a 54px minimum target, bottom scroll clearance, and extra footer space keep it usable on mobile. While the mobile menu is open, its own language link remains available and the floating duplicate is hidden to avoid overlap.

Above 1024px, the existing language link remains in the full desktop navbar, and the full-width header stays on screen while scrolling. Desktop anchor offsets prevent the sticky header from covering destination headings. The floating shortcut is hidden on desktop and in print.

## Client feedback revision, November 10

The current preview supersedes the printable field-guide interface. It uses the supplied Van Berg logo green (#8dbb4a) for the hero text panel and contrast frame, with dark readable text, a white page, and Ivan’s original portrait. Matt Medicares was reviewed for its contrasting hero, clear consultation/phone hierarchy, and personal introduction; none of its branding, testimonials, carrier counts, or other business claims were copied.

The hero consultation button goes to the disabled callback/appointment preview. Its second box provides the requested call-or-text wording, plus a separate SMS link so both actions work on supported devices. It does not claim a booking is completed. The three illustrated service buttons now show the supplied Medicare Advantage, Medicare Supplement with Prescription Drug Plan, and Employer & Group Health Plans descriptions. First-person language is used in marketing copy; the supplied legal wording stays unchanged.

Yami’s 11 supplied FAQ answers replace the question-selection and print interface. Native details/summary dropdowns work without JavaScript. The appointment FAQ is deliberately adapted to call/text only until the online service is connected and tested. English source content and Spanish translations live in scripts/client-feedback.mjs. Spanish translation and insurance/compliance review remain required before launch. The supplied green logo is unmodified; black/white alternatives have not yet been received.

No production merge, domain purchase, client outreach, live calendar, or enabled data collection is included. npm run check covers the client requirements plus existing navigation, progressive enhancement, accessibility, and disclosure tests. Historical guide/video modules remain unused by the rendered pages.

## Restrained visual revision

The latest visual revision restores the earlier white editorial hero and original portrait proportions. It supersedes the large green text panel, surrounding frame, and portrait offset shadow described above. Brand green is limited to a thin header rule and the existing service-promise accent. Original typography, spacing, background surfaces, and section character are retained. The requested consultation links, first-person copy, supplied FAQs, service descriptions, Spanish pages, and honest disabled request prototype remain intact. This is a feature preview only.
