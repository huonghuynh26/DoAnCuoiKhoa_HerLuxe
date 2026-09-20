from pathlib import Path
import re
root = Path(__file__).parent
pages = ["about.html", "contact.html", "faq.html", "login.html", "register.html"]
for filename in pages:
    path = root / filename
    text = path.read_text(encoding="utf-8")
    text, count = re.subn(r"\s*<header class=\"header\">.*?</header>", '\n      <div data-site-header></div>', text, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f"Could not replace header in {filename}")
    if 'href="header.css"' not in text:
        text = text.replace('    <link rel="stylesheet" href="', '    <link rel="stylesheet" href="header.css" />\n    <link rel="stylesheet" href="', 1)
    if '<script src="header.js"></script>' not in text:
        text = text.replace("  </body>", '    <script src="header.js"></script>\n  </body>', 1)
    path.write_text(text, encoding="utf-8")
print(f"Updated {len(pages)} pages with shared header mount points.")
