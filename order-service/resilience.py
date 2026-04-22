import logging
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    RetryCallState,
)
import requests

logger = logging.getLogger("resilience")
logging.basicConfig(level=logging.INFO)


def make_retry_logger(order_id: str, service_name: str, append_fn):
    """Returns a before_sleep callback that logs the retry to stdout and persists it to the DB."""
    def log_retry(retry_state: RetryCallState):
        attempt = retry_state.attempt_number
        msg = f"[RETRY] {service_name} | tentativa {attempt} | pedido {order_id}"
        logger.warning(msg)
        append_fn(order_id, msg)
    return log_retry


def call_with_retry(
    url: str,
    payload: dict,
    order_id: str,
    service_name: str,
    append_fn,
    timeout: int = 3,
):
    """
    POST with 3s timeout, exponential backoff (1s, 2s, 4s), max 3 attempts.
    Retries only on network/timeout errors — not on HTTP 4xx.
    reraise=True: after exhausting retries the original exception propagates
    so the caller can apply fallback logic.
    """
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=4),
        retry=retry_if_exception_type((requests.Timeout, requests.ConnectionError)),
        before_sleep=make_retry_logger(order_id, service_name, append_fn),
        reraise=True,
    )
    def _do_post():
        return requests.post(url, json=payload, timeout=timeout)

    return _do_post()
