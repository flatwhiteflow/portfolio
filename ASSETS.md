# Current asset provenance

- `assets/fabio-original.jpg`: exact byte-for-byte copy of the user-supplied IMG_0451.JPG. This is the visible face, body and background.
- `assets/fabio-logo-edit.jpg`: built-in image tool result. Only a small chest region is displayed using a feathered CSS mask; its generated face and background are never displayed.
- Outfit and IBM Plex Mono: locally hosted fonts with included OFL licenses.

The white-shirt edit was rejected and never installed. Earlier beige portrait files are unused.

## Logo edit prompt
Remove only the AWS lettering and yellow smile from the black t-shirt. Replace with matching cotton texture and natural folds. Preserve everything else. The result is clipped on the website to the logo region to guarantee that generated changes elsewhere cannot affect the displayed original face.

## Depth
The current hero retains the photograph's real light and textured brick wall, framed on a warm beige surface with a directional highlight and soft cast shadow.

## Wide studio alternative (studio.html)
Uses `fabio-studio-soft.jpg`, generated from the user's supplied wide beige portrait to remove the AWS logo and add faint softbox falloff and a diffuse shadow behind the right shoulder. `fabio-studio-source.png` is an exact copy of the supplied wide reference; the head is overlaid through an SVG feathered mask, preserving the reference face. Both layers share the same image coordinates at every viewport size. The older framed studio treatment and its subject mask are no longer used.

## Interactive atmosphere study
`assets/shader.js` is built from the official `@shadergradient/react` 2.4.20 package, React, React Three Fiber and Three.js. The authored entry point and dependency lockfile are under `source/shader/`. It uses warm parchment, clay and umber colours with softened 3D lighting. The thread version remains a local 2D canvas implementation with no renderer dependency.
