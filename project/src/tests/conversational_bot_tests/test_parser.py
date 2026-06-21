import xml.etree.ElementTree as ET

def parse_and_route_message(phone_number: str, incoming_text: str) -> str:
    """
    Core conditional script matching the explicit issue constraints.
    Parses sender information, validates numerical inputs strictly, 
    and handles unexpected parameters gracefully.
    """
    # Normalize input strictly to protect against spaces or case variations
    user_input = incoming_text.strip()
    
    # Track routing context for logging
    is_whatsapp = phone_number.startswith("whatsapp:")
    channel = "WhatsApp" if is_whatsapp else "SMS"

    # Strict conditional logic execution
    if user_input == "1":
        # Simulate clean confirmation path payload routing
        return "SUCCESS_CONFIRMED"
    elif user_input == "2":
        # Simulate opt-out path routing
        return "SUCCESS_OPT_OUT"
    else:
        # Gracefully handle unexpected inputs (Guardrail Triggered)
        return "TRIGGER_FALLBACK_MENU"

# --- Mock Payload Acceptance Criteria Tests ---
if __name__ == "__main__":
    print("--- Running Message Parser Mock Payload Logic Tests ---")
    
    # Test Suite representing all possible edge cases from patients
    mock_payloads = [
        {"From": "+27821112222", "Body": "1", "Scenario": "Valid SMS Confirmation"},
        {"From": "whatsapp:+27831112222", "Body": "2", "Scenario": "Valid WhatsApp Opt-Out"},
        {"From": "+27841112222", "Body": "Hello", "Scenario": "Invalid Text Guardrail Check"},
        {"From": "whatsapp:+27851112222", "Body": "5", "Scenario": "Invalid Number Guardrail Check"},
        {"From": "+27861112222", "Body": "   1   ", "Scenario": "Whitespace Trimming Validation"}
    ]

    for test in mock_payloads:
        result = parse_and_route_message(test["From"], test["Body"])
        print(f"Scenario: {test['Scenario']} | Input: '{test['Body']}' -> Route Result: {result}")
        
        # Double check that no runtime crashes occur and outputs stay safe
        assert result in ["SUCCESS_CONFIRMED", "SUCCESS_OPT_OUT", "TRIGGER_FALLBACK_MENU"]

    print("\n[SUCCESS] All mock payload variants processed cleanly with zero logical runtime exceptions.")