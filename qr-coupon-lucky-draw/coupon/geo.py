"""Access to the bundled list of Indian states and districts.

The state field is a closed dropdown -- a value not on the list is rejected --
because states are stable and a clean state column is what makes the sheet
worth sorting. Districts are deliberately open: they get created and renamed
often enough that a stale list would block a real person from claiming a real
prize, which is a far worse failure than an unrecognised district string.
"""

from __future__ import annotations

import json
from functools import lru_cache

from .config import PACKAGE_ROOT

_DATA_FILE = PACKAGE_ROOT / "data" / "india_states_districts.json"


@lru_cache(maxsize=1)
def _load() -> dict[str, list[str]]:
    with _DATA_FILE.open(encoding="utf-8") as handle:
        return json.load(handle)["states"]


@lru_cache(maxsize=1)
def _lookup() -> dict[str, str]:
    """Case-and-space-insensitive index of state name -> canonical spelling."""
    return {_key(name): name for name in _load()}


def _key(value: str) -> str:
    return "".join(ch for ch in (value or "").lower() if ch.isalnum())


def states() -> list[str]:
    """Every state and union territory, alphabetically."""
    return list(_load().keys())


def districts(state: str) -> list[str]:
    """Districts of ``state``, or an empty list for an unknown state."""
    canonical = is_known_state(state)
    return list(_load().get(canonical, [])) if canonical else []


def all_districts() -> list[str]:
    """Every district in the country, de-duplicated and sorted.

    Used for the ``<datalist>`` fallback when the browser has JavaScript
    turned off and we cannot narrow suggestions to the chosen state.
    """
    seen: set[str] = set()
    for names in _load().values():
        seen.update(names)
    return sorted(seen)


def is_known_state(value: str) -> str | None:
    """Return the canonical spelling of ``value``, or ``None``."""
    return _lookup().get(_key(value))


def districts_by_state() -> dict[str, list[str]]:
    """The whole mapping, for embedding in the page as JSON."""
    return {state: list(names) for state, names in _load().items()}
