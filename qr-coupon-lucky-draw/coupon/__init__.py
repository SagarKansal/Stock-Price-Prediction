"""QR coupon lucky draw.

A coupon carries a unique alphanumeric code and a QR code that points at the
claim site. A participant scans it, enters their mobile number, then their
name, state and district, and receives an SMS with the prize assigned to that
coupon. Every code and every claim is a row in a Google Sheet. A second scan
of the same coupon shows that the prize has already been claimed.
"""

__version__ = "1.0.0"
