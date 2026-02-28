import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-1.5-flash")


async def chat_once(session_id: str, system_message: str, user_text: str):

    try:
        final_prompt = f"""
SYSTEM:
{system_message}

USER:
{user_text}
"""

        response = model.generate_content(final_prompt)

        return response.text

    except Exception as e:
        return f"Gemini Error: {str(e)}"