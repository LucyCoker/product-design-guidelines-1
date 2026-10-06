#!/usr/bin/env python3
"""Embed the current guideline pages into the Library tools.

Ask the Library and the Prototype Checker only answer from this corpus, so
re-run this after any guideline change, then republish both pages:

    python3 explorations/library-teammate/build_corpus.py
"""
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SITE = "https://denkungsart.github.io/product-design-guidelines"
REPO = "https://github.com/denkungsart/product-design-guidelines/blob/main/"

SOURCES = [
    "AGENTS.md",
    "products/filmmakers-system/README.md",
    "products/filmmakers-system/foundations/colour.md",
    "products/filmmakers-system/foundations/typography.md",
    "products/filmmakers-system/components/buttons.md",
    "patterns/Patterns overview",
    "patterns/button-hierarchy.md",
    "patterns/destructive-actions.md",
    "patterns/Button groups",
]
TARGETS = [HERE / "ask" / "index.html", HERE / "checker" / "index.html"]


def parse(path):
    raw = (ROOT / path).read_text(encoding="utf-8")
    meta = {}
    m = re.match(r"^---\n(.*?)\n---\n", raw, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        raw = raw[m.end():]
    h1 = re.search(r"^# (.+)$", raw, re.M)
    title = meta.get("title") or (h1.group(1) if h1 else Path(path).stem)
    title = re.sub(r"^Filmmakers System — ", "", title)
    status = re.search(r"Status: (\w+)", raw)
    url = SITE + meta["permalink"] if "permalink" in meta else REPO + path.replace(" ", "%20")
    if path == "AGENTS.md":
        title = "How to use these guidelines"
    sections, heading, buf, trail = [], title, [], []

    def flush():
        text = "\n".join(buf).strip()
        if text:
            sections.append({"h": heading, "trail": " › ".join(trail), "text": text})

    for line in raw.splitlines():
        hm = re.match(r"^(#{1,4}) (.+)$", line)
        if hm:
            flush()
            level, heading, buf = len(hm.group(1)), hm.group(2).strip(), []
            trail = trail[: max(level - 2, 0)] + ([heading] if level > 1 else [])
        else:
            buf.append(line)
    flush()
    return {"title": title, "path": path, "url": url,
            "status": status.group(1) if status else "", "text": raw.strip(), "sections": sections}


def main():
    corpus = {"built": date.today().isoformat(), "pages": [parse(p) for p in SOURCES]}
    payload = json.dumps(corpus, ensure_ascii=False).replace("</", "<\\/")
    for target in TARGETS:
        html = target.read_text(encoding="utf-8")
        new = re.sub(r'(<script id="corpus" type="application/json">).*?(</script>)',
                     lambda m: m.group(1) + payload + m.group(2), html, count=1, flags=re.S)
        target.write_text(new, encoding="utf-8")
        print(f"{target.relative_to(ROOT)}: {len(corpus['pages'])} pages, {len(payload)} bytes")


if __name__ == "__main__":
    main()
