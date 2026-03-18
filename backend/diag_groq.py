import os
import sys
from groq import Groq

def test_groq():
    api_key = os.getenv("GROQ_API_KEY", "test_key")
    print(f"Python version: {sys.version}")
    try:
        import groq
        print(f"Groq version: {groq.__version__}")
    except:
        print("Could not get groq version")
        
    try:
        import httpx
        print(f"httpx version: {httpx.__version__}")
    except:
        print("Could not get httpx version")

    print("\nAttempting to initialize Groq client...")
    try:
        client = Groq(api_key=api_key)
        print("Success!")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_groq()
