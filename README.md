# Fabio Petriccione: Complexity, made useful

A standalone personal website using semantic HTML, native CSS and a local Canvas 2D sculpture. No build step, analytics, API keys or runtime dependencies.

## Preview

From this directory:

```sh
python3 -m http.server 5174 --bind 127.0.0.1
```

Open http://localhost:5174. Stop with Ctrl+C. To publish later, upload this directory to any static web host.

## Edit

- `index.html`: verified portfolio copy, Git-style career branches, contact links.
- `styles.css`: responsive layout, palette, locally hosted fonts.
- `site.js`: sculpture, accessible career tabs, motion preferences.
- `assets/`: locally hosted fonts, favicon, and original black-shirt portrait with a local logo-removal overlay.

The existing site on port 5173 is not modified. Content was taken from that site's rendered portfolio. The 60% achievement is repeated from the supplied portfolio, not independently audited. No project examples or testimonials were invented.

Accessibility: semantic sections, semantic career timeline, skip link, visible focus states, reduced-motion support, motion pause button. The canvas is decorative narrative content; all professional information remains readable without JavaScript.

Design: warm paper #eee6db, dark brown #35291f, and walnut #8b5b3c. Outfit variable and IBM Plex Mono fonts are hosted locally. The original portrait is displayed unchanged, with only a tightly clipped logo-removal layer on the chest. Face, lighting and brick wall remain original. Career wording and branch geometry are restored from the original portfolio. The animated gradient shares the pause control with the sculpture. Systems / Cloud / Applied AI tabs support arrow keys, Home and End.

Studio comparison: open `studio.html`. It uses a full-hero beige portrait with soft studio shadows and the reference face retained as a separate masked layer. The comparison links switch between this version and the original brick-wall treatment in `index.html`.

## Editorial revision — 18 September

- Main version: `studio.html` (thread sculpture). Alternate: `shader.html` (warm ShaderGradient). Comparison links at the top. The pre-revision pages are preserved in `previous/`.
- Follow the thread now goes to `#systems`; Experience goes to `#experience`.
- The career graph is one SVG, measured against the text anchors after fonts load and on resize. Its static and active strokes use identical paths; a shared clip follows scroll position in either direction. Reduced motion reveals the whole graph.
- The sculpture responds to mouse movement and drag with damped momentum and a capped speed boost. Touch scroll remains native; chapter tabs work with touch and arrow keys. Pause and reduced-motion controls are retained.
- Replaced repeated slogan sections with three concrete work entries; simplified the panel shapes, colour hierarchy and typography.
- Shader uses the official @shadergradient/react package. Its local production bundle is about 1.3 MB before compression and loads only on the alternate page. This is a heavier visual study, not included in the main version. Source and lockfile are in `source/shader/`: `npm ci`, then `npm run build`. Some package internals may request environment assets externally.

Validation: JavaScript syntax and shader production build passed. Browser checks at 1440, 793 and 390 px found zero pixel deviation between all 15 SVG dot centres and their text anchors; no horizontal overflow at 1440 or 390 px. Verified scroll progression, drag, chapter switching, arrow-key navigation, pause controls and both alternate links. Reduced-motion behavior is implemented but was not emulated in browser testing. Shader loaded without runtime errors (upstream Three.js clock deprecation warnings remain).

## Selected stories update
Thread is the canonical homepage (`index.html` and `studio.html`). The comparison bar has been removed. Selected stories now expand inline to explain the GitLab assessment tool and the AWS Summit session with Steamhaus and Sperry Rail. See `CONTENT-SOURCES.md` for source attribution and timing caveats. The footer uses static thread linework and a personal wordmark. Earlier studies are retained for reference.
