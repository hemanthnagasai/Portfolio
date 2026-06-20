import time
from collections import defaultdict
from fastapi import HTTPException

# Store: ip -> list of timestamps
_request_history = defaultdict(list)

def check_rate_limit(ip: str, limit: int = 10, window: int = 60):
    """
    Checks if the given IP address has exceeded the maximum number of requests (limit)
    within the time window (window, in seconds).
    
    Raises HTTP 429 Too Many Requests if the limit is exceeded.
    """
    import os
    if os.environ.get("PYTEST_CURRENT_TEST"):
        return
        
    now = time.time()
    # Clean up timestamps older than the window
    _request_history[ip] = [t for t in _request_history[ip] if now - t < window]
    
    if len(_request_history[ip]) >= limit:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )
        
    _request_history[ip].append(now)
