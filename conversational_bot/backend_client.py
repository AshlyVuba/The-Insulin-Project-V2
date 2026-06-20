import os
import asyncio
import logging
import httpx

# Configure logging to monitor network bridge status
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("NetworkBridge")

# Target backend coordination setup
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000/api/v1")

# Guardrails: Structured retry configuration to prevent memory leaks
MAX_RETRY_ATTEMPTS = 3
PENDING_CONFIRMATIONS_QUEUE = []

def log_permanent_failure(item: dict):
    """
    Writes un-syncable records to a local file breakdown for manual admin 
    reconciliation after exceeding max retry cap. Prevents total data loss.
    """
    try:
        with open("failed_syncs_dead_letter.log", "a") as f:
            f.write(f"PERMANENT FAILURE - Phone: {item['phone_number']} | Code: {item['express_code']} | Channel: {item['distribution_channel']}\n")
        logger.error(f"CRITICAL: Item for {item['phone_number']} exceeded max retries. Permanently archived to dead-letter log.")
    except Exception as e:
        logger.error(f"Failed to write to dead letter log: {e}")

async def sync_confirmation_to_backend(phone_number: str, express_code: str, distribution_channel: str) -> bool:
    """
    Sends a POST request to Tshepang's API to confirm a patient's slot.
    """
    payload = {
        "phone_number": phone_number,
        "express_code": express_code,
        "distribution_channel": distribution_channel,
        "status": "CONFIRMED"
    }
    
    target_url = f"{BACKEND_API_URL}/appointments/confirm"

    try:
        logger.info(f"Attempting to sync {express_code} for {phone_number} to backend...")
        async with httpx.AsyncClient() as client:
            response = await client.post(target_url, json=payload, timeout=3.0)
            
            if response.status_code in (200, 201):
                logger.info(f"Successfully synced confirmation for {express_code} to database.")
                return True
            else:
                logger.warning(f"Backend rejected payload with status code: {response.status_code}")
                
    except (httpx.ConnectError, httpx.TimeoutException, httpx.HTTPError) as e:
        logger.error(f"Backend connection failed or timed out. Crash prevented. Reason: {e}")
    
    # Check if this phone number is already buffered in the queue
    already_queued = any(queued_item["payload"]["phone_number"] == phone_number for queued_item in PENDING_CONFIRMATIONS_QUEUE)

    if not already_queued:
        # Buffer transaction with an explicit starting retry count of 0
        PENDING_CONFIRMATIONS_QUEUE.append({
            "payload": {
                "phone_number": phone_number,
                "express_code": express_code,
                "distribution_channel": distribution_channel
            },
            "retry_count": 0
        })
        logger.info(f"Patient transaction buffered to local memory retry queue. Queue size: {len(PENDING_CONFIRMATIONS_QUEUE)}")
        
    return False

async def process_retry_queue_worker():
    """
    Background worker loop managing retry lifecycles with hard termination ceilings.
    """
    while True:
        await asyncio.sleep(10) # Check every 10 seconds
        
        if PENDING_CONFIRMATIONS_QUEUE:
            # Process the front item in the queue
            current_item = PENDING_CONFIRMATIONS_QUEUE[0]
            payload = current_item["payload"]
            
            # Increment current attempt tracking
            current_item["retry_count"] += 1
            logger.info(f"Retrying sync for {payload['express_code']} (Attempt {current_item['retry_count']}/{MAX_RETRY_ATTEMPTS})...")
            
            success = await retry_sync_attempt(payload)
            
            if success:
                logger.info(f"Retry successful! Removing {payload['express_code']} from memory.")
                PENDING_CONFIRMATIONS_QUEUE.pop(0)
            else:
                # If it failed and reached the max threshold, drop it entirely to clear up system memory
                if current_item["retry_count"] >= MAX_RETRY_ATTEMPTS:
                    log_permanent_failure(payload)
                    PENDING_CONFIRMATIONS_QUEUE.pop(0) # Evict item from memory to prevent leak loops
                else:
                    # Move to the back of the queue if it failed but still has lives remaining
                    PENDING_CONFIRMATIONS_QUEUE.append(PENDING_CONFIRMATIONS_QUEUE.pop(0))

async def retry_sync_attempt(payload: dict) -> bool:
    """Helper method executing the raw request retry layout."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BACKEND_API_URL}/appointments/confirm", 
                json={**payload, "status": "CONFIRMED"}, 
                timeout=2.0
            )
            return response.status_code in (200, 201)
    except Exception:
        return False