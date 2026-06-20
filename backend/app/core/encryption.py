import os
from cryptography.fernet import Fernet
from sqlalchemy.types import TypeDecorator, String

# OWASP A02 Defense: Load the POPIA key from the secure environment
encryption_key = os.getenv("POPIA_ENCRYPTION_KEY")

# Failsafe for local hackathon development
if not encryption_key:
    # If no key exists, generate a temporary one (DO NOT use this in production)
    encryption_key = Fernet.generate_key().decode()
    print("WARNING: Using a temporary encryption key. Set POPIA_ENCRYPTION_KEY in your ..env file!")

fernet = Fernet(encryption_key.encode())

class EncryptedString(TypeDecorator):
    """
    Custom SQLAlchemy Type. 
    Intercepts data going into the database and encrypts it (POPIA compliance).
    Intercepts data coming out of the database and decrypts it for the frontend.
    """
    impl = String # Under the hood, PostgreSQL will just see a long text string

    def process_bind_param(self, value, dialect):
        """Runs automatically when SAVING to the database."""
        if value is not None:
            # Encrypt the plaintext string into a secure byte token, then store as string
            return fernet.encrypt(value.encode('utf-8')).decode('utf-8')
        return value

    def process_result_value(self, value, dialect):
        """Runs automatically when READING from the database."""
        if value is not None:
            # Decrypt the ciphertext back into readable plaintext for the APIs
            return fernet.decrypt(value.encode('utf-8')).decode('utf-8')
        return value