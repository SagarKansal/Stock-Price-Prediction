"""A small in-process rate limiter.

Deliberately not Redis-backed. The thing worth throttling here is somebody
walking the code space from a handful of IPs, and a per-process sliding window
handles that on the single-instance deployment this system is sized for. If
you run several instances behind a load balancer, put a real limiter in the
proxy -- this one only sees its own share of the traffic.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque

WINDOW_SECONDS = 60


class RateLimiter:
    def __init__(self, max_events: int, window: int = WINDOW_SECONDS) -> None:
        self.max_events = max_events
        self.window = window
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()
        self._last_sweep = time.monotonic()

    def allow(self, key: str) -> bool:
        """Record a hit for ``key`` and say whether it stays under the limit."""
        if self.max_events <= 0:
            return True

        now = time.monotonic()
        cutoff = now - self.window
        with self._lock:
            bucket = self._hits[key]
            while bucket and bucket[0] < cutoff:
                bucket.popleft()
            allowed = len(bucket) < self.max_events
            if allowed:
                bucket.append(now)
            self._sweep(now, cutoff)
        return allowed

    def _sweep(self, now: float, cutoff: float) -> None:
        """Drop idle buckets so a long run does not leak memory per IP."""
        if now - self._last_sweep < self.window:
            return
        self._last_sweep = now
        for key in [k for k, v in self._hits.items() if not v or v[-1] < cutoff]:
            del self._hits[key]

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()
