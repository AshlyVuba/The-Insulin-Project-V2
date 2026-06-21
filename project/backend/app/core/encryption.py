import os
from cryptography.fernet import Fernet
from sqlalchemy.types import TypeDecorator, String

# OWASP A02 Defense: Load the POPIA key from the secure environment.
# This key encrypts all patient PII fields at rest (POPIA compliance).
encryption_key = os.getenv("POPIA_ENCRYPTION_KEY")

# Hard fail if the key is missing — same pattern as security.py for JWT_SECRET_KEY.
# A silent fallback (generating a throwaway key) would silently corrupt all
# encrypted data on restart, making patient records permanently unreadable.
if not encryption_key:
    raise RuntimeError(
        "CRITICAL: POPIA_ENCRYPTION_KEY environment variable is not set. "
        "Generate a key with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\" "
        "and add it to backend/..env"
    )

fernet = Fernet(encryption_key.encode())


class EncryptedString(TypeDecorator):
    """
    Custom SQLAlchemy Type.
    Intercepts data going into the database and encrypts it (POPIA compliance).
    Intercepts data coming out of the database and decrypts it for the frontend.
    """
    impl = String  # Under the hood, PostgreSQL will just see a long text string
    cache_ok = True

    def process_bind_param(self, value, dialect):
        """Runs automatically when SAVING to the database."""
        if value is not None:
            # Encrypt the plaintext string into a secure byte token, then store as string
            return fernet.encrypt(value.encode("utf-8")).decode("utf-8")
        return value

    def process_result_value(self, value, dialect):
        """Runs automatically when READING from the database."""
        if value is not None:
            # Decrypt the ciphertext back into readable plaintext for the APIs
            return fernet.decrypt(value.encode("utf-8")).decode("utf-8")
        return value


import hmac
import hashlib

# Separate secret for phone number hashing — derived from the same key.
# Using HMAC-SHA256 gives us a deterministic, one-way value we can index
# and query without ever storing or comparing plaintext phone numbers.
_hmac_key = encryption_key.encode("utf-8")


def hash_phone(phone_number: str) -> str:
    """
    Returns a deterministic HMAC-SHA256 hex digest of a phone number.
    Use this value for database lookups instead of the plaintext number.

    Example:
        WHERE phone_number_hash = hash_phone("+27821234567")
    """
    return hmac.new(_hmac_key, phone_number.encode("utf-8"), hashlib.sha256).hexdigest()
