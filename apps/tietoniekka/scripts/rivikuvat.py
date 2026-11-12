#!/usr/bin/env python3
"""Rivikuvat hub-sivujen laajuusriveille (hub-runko §4, Heikki 12.11.2026).

Rivin kuva-ala on 96 × 72 CSS-pikseliä; ladataan 288 × 216 (3×) -kopio, ei 720–1600 px:n korttikuvaa.
Rajaus noudattaa kortin object-positionia ("center 40%", "56% 50%"), jotta rivi näyttää samalta kuin ennen.

Käyttö (apps/tietoniekka-kansiosta):
  python3 scripts/rivikuvat.py <lähde public/-polkuna> <kohde public/-polkuna> [pos]
  esim. python3 scripts/rivikuvat.py /20/etusivu/sp-helsinki-kortti.webp /20/rivi/tupla-suomen-kaupungit.webp "center 55%"
"""
import sys
from pathlib import Path
from PIL import Image

W, H = 288, 216
PUBLIC = Path(__file__).resolve().parent.parent / "public"


def osuus(arvo: str) -> float:
    arvo = arvo.strip()
    return {"left": 0.0, "top": 0.0, "center": 0.5, "right": 1.0, "bottom": 1.0}.get(arvo) if not arvo.endswith("%") else float(arvo[:-1]) / 100


def tee(lahde: str, kohde: str, pos: str = "50% 40%") -> None:
    im = Image.open(PUBLIC / lahde.lstrip("/")).convert("RGB")
    x, y = (pos.split() + ["50%"])[:2]
    skaala = max(W / im.width, H / im.height)
    sw, sh = round(im.width * skaala), round(im.height * skaala)
    im = im.resize((sw, sh), Image.LANCZOS)
    vasen, yla = round((sw - W) * osuus(x)), round((sh - H) * osuus(y))
    ulos = PUBLIC / kohde.lstrip("/")
    ulos.parent.mkdir(parents=True, exist_ok=True)
    im.crop((vasen, yla, vasen + W, yla + H)).save(ulos, "WEBP", quality=78, method=6)
    print(f"{kohde}  {ulos.stat().st_size // 1024} kB")


if __name__ == "__main__":
    tee(*sys.argv[1:])
