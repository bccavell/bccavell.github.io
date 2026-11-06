# ============================================================
# make_qr.py: generates the QR code on the welcome card
# ============================================================
# You only need to run this again if the app's web address changes.
#
#   pip install qrcode
#   python3 january-visit/planning/make_qr.py
#
# It writes january-visit/qr.svg.
#
# WHY PYTHON AND NOT JAVASCRIPT? The QR code never changes, so we
# make it ONCE, ahead of time, and save the picture. A JavaScript
# version would rebuild the same picture every time someone opens
# the card, and would need an extra library downloaded from the
# internet to do it. "Do the work once at build time instead of every
# time at run time" is a common trade-off in real projects.
#
# WHY SVG? SVG is a picture described as shapes ("a square here, a
# square there") instead of pixels. It stays perfectly sharp at any
# size, which matters for a QR code you're going to print.
# ============================================================

import qrcode
import qrcode.image.svg
from pathlib import Path

APP_URL = "https://bccavell.github.io/january-visit/"

# ERROR_CORRECT_H = "High" error correction. A QR code stores extra
# backup copies of its data, so it still scans when part of it is
# covered or damaged. "H" can lose about 30% and still work, which is
# what lets us put a little heart over the middle of it.
qr = qrcode.QRCode(
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,  # size of each little square (SVG scales anyway)
    border=2,     # the blank margin, in squares. Scanners need some.
)
qr.add_data(APP_URL)
qr.make(fit=True)  # pick the smallest grid that fits the URL

# SvgPathImage draws all the squares as one shape, giving a small, tidy file.
image = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)

# Save it next to index.html. Path(__file__) is the location of THIS
# script, so this works no matter which folder you run it from.
output = Path(__file__).resolve().parent.parent / "qr.svg"
image.save(str(output))
print(f"Saved {output} -> {APP_URL}")
