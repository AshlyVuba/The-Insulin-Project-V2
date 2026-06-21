import secrets

def generate_fast_track_code() -> str:
    """
    Generates a secure, highly legible 4-character alphanumeric Express Code.
    
    Guardrails Enforced:
    - Fixed short prefix 'INS-' for quick visual indexing by clinic marshals.
    - Excludes '0', 'O', '1', 'I', 'S', '5' to eliminate handwriting cross-reference errors.
    - Uses 'secrets' module for secure token distribution.
    """
    # Custom high-legibility alphabet
    LEGBILE_ALPHABET = "2346789ABCDEFGHJKLMNPQRTUVWXYZ"
    
    # Securely select 4 characters from our legible alphabet
    code_chars = [secrets.choice(LEGBILE_ALPHABET) for _ in range(4)]
    
    return f"INS-{''.join(code_chars)}"
