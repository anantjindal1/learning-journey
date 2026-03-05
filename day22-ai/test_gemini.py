from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="Summarize this in one sentence: Big product launch planned for March. Engineering, marketing, and sales need to coordinate. Key risk is API not ready."
)

print(response.text)