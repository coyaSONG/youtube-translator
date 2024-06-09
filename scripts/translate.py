import os
import sys
import openai
import pysrt

openai.api_key=os.getenv("OPENAI_API_KEY")

input_file = sys.stdin.read()
subs = pysrt.from_string(input_file)

base_prompt = (
    "You are a skilled translator and developer. "
    "Translate the following English text to Korean. "
    "Translate from [START] to [END]:\n[START]"
)

def translate_text(text):
    messages = [
        {"role": "system", "content": "You are a skilled translator and developer."},
        {"role": "user", "content": f"Translate the following English text to Korean: {text}"}
    ]
    
    res = openai.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        max_tokens=3000,
        temperature=0.3
    )
    return res.choices[0].message.content

for index, subtitle in enumerate(subs):
    subtitle.text = translate_text(subtitle.text)
    print(subtitle, flush=True)

