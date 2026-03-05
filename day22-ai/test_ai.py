from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

response = client.chat.completions.create(
    model="llama-3.1-8b-instant",  # free, fast model
    messages=[
        {"role": "system", "content": "You are a helpful productivity assistant. Be concise."},
        {"role": "user", "content": "Summarize this in one sentence: Big product launch planned for March. Engineering, marketing, and sales need to coordinate. Key risk is API not ready."}
    ]
)

print(response.choices[0].message.content)