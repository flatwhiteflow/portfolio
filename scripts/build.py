"""Assemble the static site without changing its public URLs."""

from pathlib import Path
from shutil import copy2, copytree, rmtree


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src"
OUTPUT = ROOT / "dist"
PUBLISHABLE = {".html", ".css", ".js", ".xml", ".txt"}
SPECIAL = {"CNAME", ".nojekyll"}
WEB_ANALYTICS = (
    '<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" '
    """data-cf-beacon='{"token": "ee43b742188a4599b64477398e85a14f"}'></script>"""
)


def copy_pages(directory: Path) -> None:
    for source in directory.iterdir():
        if not source.is_file() or (source.suffix not in PUBLISHABLE and source.name not in SPECIAL):
            continue
        destination = OUTPUT / source.name
        if destination.exists():
            raise RuntimeError(f"Duplicate published filename: {destination.name}")
        if source.suffix == ".html":
            html = source.read_text(encoding="utf-8")
            if html.count("</body>") != 1:
                raise RuntimeError(f"Expected one closing body tag: {source.name}")
            destination.write_text(
                html.replace("</body>", f"{WEB_ANALYTICS}</body>"),
                encoding="utf-8",
            )
        else:
            copy2(source, destination)


def main() -> None:
    if OUTPUT.exists():
        rmtree(OUTPUT)
    OUTPUT.mkdir()
    copy_pages(SOURCE)
    copy_pages(SOURCE / "notes")
    copytree(SOURCE / "assets", OUTPUT / "assets")
    for name in ("index.html", "notes.html", "CNAME", "robots.txt", "sitemap.xml"):
        if not (OUTPUT / name).is_file():
            raise RuntimeError(f"Missing required published file: {name}")
    print(f"Built {OUTPUT}")


if __name__ == "__main__":
    main()
