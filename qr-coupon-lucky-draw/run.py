"""WSGI entry point.

    gunicorn --workers 3 --bind 0.0.0.0:8000 run:app

For local development ``python -m coupon.cli serve`` is easier, since it
prints the configuration it is running with.
"""

from coupon.web import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
