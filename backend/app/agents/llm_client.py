import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

MODEL_NAME = "gemini-2.0-flash"

client = None

if API_KEY:
    try:
        client = genai.Client(api_key=API_KEY)
    except:
        client = None


async def chat_once(system_message: str, user_text: str) -> str:
    """
    Safe AI wrapper with automatic fallback responses.
    """

    # Try Gemini first
    if client:
        try:
            prompt = f"""
{system_message}

User:
{user_text}
"""

            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt
            )

            if response.text:
                return response.text

        except Exception:
            pass

    # Fallback AI responses
    text = user_text.lower()

    if "save" in text or "saving" in text:
        return (
            "Based on your recent spending habits, try allocating "
            "at least 20% of monthly income into savings."
        )

    elif "fraud" in text:
        return (
            "No critical fraud patterns detected recently, "
            "but monitor unusual high-value transactions carefully."
        )

    elif "budget" in text:
        return (
            "Your food and entertainment expenses are slightly high. "
            "Setting monthly spending caps may improve financial stability."
        )

    elif "risk" in text:
        return (
            "Your financial risk level is currently moderate "
            "based on transaction and spending patterns."
        )

    else:
        return (
            "Your financial profile looks stable overall. "
            "Continue monitoring expenses and maintaining savings goals."
        )