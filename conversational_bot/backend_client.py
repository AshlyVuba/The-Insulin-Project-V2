import os
import asyncio
import logging
import httpx

# Configure logging to monitor network bridge status
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("NetworkBridge")

# Target backend coordination setup
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000/api/v1")

# Resilient in-memory retry queue for offline conditions
PENDING_CONFIRMATIONS_QUEUE = []

async def sync_confirmation_to_backend(phone_number: str, express_code: str, distribution_channel: str) -> bool:
    """
    Sends a POST request to Tshepang's API to confirm a patient's slot.
    
    Guardrails Enforced:
    - Non-blocking asynchronous network calls using httpx.
    - Catches network connection losses and queues failed states safely without crashing.
    """
    payload = {
        "phone_number": phone_number,
        "express_code": express_code,
        "distribution_channel": distribution_channel,
        "status": "CONFIRMED"
    }
    
    target_url = f"{BACKEND_API_URL}/appointments/confirm"

    try:
        async with httpx.AsyncClient() as client:
            logger.info(f"Attempting to sync {express_code} for {phone_number} to backend...")
            response = await client.post(target_url, json=payload, timeout=3.0)
            
            if response.status_code in (200, 201):
                logger.info(f"Successfully synced confirmation for {express_code} to database.")
                return True
            else:
                logger.warning(f"Backend rejected payload with status code: {response.status_code}")
                
    except (httpx.ConnectError, httpx.TimeoutException, httpx.HTTPError) as e:
        logger.error(f"Backend connection failed or timed out. Crash prevented. Reason: {e}")
    
    # If we reach here, the network call failed. Queue the operation for a retry cycle.
    fallback_item = {
        "phone_number": phone_number,
        "express_code": express_code,
        "distribution_channel": distribution_channel
    }
    if fallback_item not in PENDING_CONFIRMATIONS_QUEUE:
        PENDING_CONFIRMATIONS_QUEUE.append(fallback_item)
        logger.info(f"Patient transaction buffered to local memory retry queue. Queue size: {len(PENDING_CONFIRMATIONS_QUEUE)}")
        
    return False

async def process_retry_queue_worker():
    """
    Background worker loop that constantly runs alongside the bot.
    If items exist in the queue, it tries to flush them back to Tshepang's API once it recovers.
    """
    while True:
        await asyncio.sleep(10) # Check every 10 seconds
        if PENDING_CONFIRMATIONS_QUEUE:
            logger.info(f"Retrying {len(PENDING_CONFIRMATIONS_QUEUE)} pending items in queue...")
            item = PENDING_CONFIRMATIONS_QUEUE[0]
            
            # Re-attempt submission
            success = await retry_sync_attempt(item)
            if success:
                PENDING_CONFIRMATIONS_QUEUE.pop(0)

async def retry_sync_attempt(item: dict) -> bool:
    """Helper method for background retry workers."""
    payload = {**item, "status": "CONFIRMED"}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{BACKEND_API_URL}/appointments/confirm", json=payload, timeout=2.0)
            return response.status_code in (200, 201)
    except Exception:
        return False