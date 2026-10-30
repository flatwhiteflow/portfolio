"""Check links to local files in the built static site."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1] / "dist"
ATTRIBUTES = {"href", "src", "poster"}


class References(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.paths: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag not in {"a", "link", "script", "img", "iframe", "source", "video"}:
            return
        self.paths.extend(value for key, value in attrs if key in ATTRIBUTES and value)


def main() -> None:
    errors: list[str] = []
    for page in ROOT.rglob("*.html"):
        parser = References()
        parser.feed(page.read_text(encoding="utf-8"))
        for reference in parser.paths:
            url = urlsplit(reference)
            if url.scheme or url.netloc or not url.path:
                continue
            target = ROOT / unquote(url.path).lstrip("/") if url.path.startswith("/") else page.parent / unquote(url.path)
            if not target.exists():
                errors.append(f"{page.relative_to(ROOT)}: {reference}")
    if errors:
        raise SystemExit("Missing local links:\n" + "\n".join(errors))
    print("Local links resolve in the published site")


if __name__ == "__main__":
    main()
