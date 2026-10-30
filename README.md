# Fabio Petriccione - Portfolio

Static portfolio and notes site, published at [fabiopetriccione.com](https://fabiopetriccione.com/).

## Structure

- `src/` contains the homepage, shared styles/scripts, SEO files, and assets.
- `src/notes/` contains the notes index, articles, and note-specific styles/scripts.
- `scripts/build.py` assembles these into `dist/`, preserving the existing public URLs such as `/notes.html` and `/building-scribby.html`.
- `.github/workflows/pages.yml` checks and deploys `dist/` to GitHub Pages on pushes to `main`. Pull requests run the build and link check without publishing.

This intentionally uses plain HTML, CSS, JavaScript, and Python's standard library. There is no runtime framework or package install.

## Local preview

```bash
python3 scripts/build.py
python3 scripts/check_site.py
python3 -m http.server 5174 -d dist
```

Open `http://localhost:5174/`. Re-run the build after editing source files.

## Add a note

1. Add `src/notes/your-note.html`, using an existing article for the shared header, footer, and metadata pattern. Its public URL will be `/your-note.html`.
2. Add a card to `src/notes/notes.html` and update `src/sitemap.xml`.
3. Put note-specific styles in `src/notes/` and shared images in `src/assets/`.
4. Build and check locally before opening a pull request.

The custom domain is configured in the repository's Pages settings and recorded in `src/CNAME`. Do not add credentials or private keys to this repository.
