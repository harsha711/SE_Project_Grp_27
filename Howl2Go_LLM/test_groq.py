import os
from groq import Groq

# Initialize Groq client with API key
client = Groq(api_key=os.environ.get("GROQ_API_KEY") or "api_key")

model = "llama-3.1-8b-instant"  # Updated to current model

# Test prompt
user_prompt = "I want a high protein meal with low carbs"
print(f"Testing with prompt: '{user_prompt}'")
print("-" * 50)

prompt = f"""Your goal is to extract nutritional and taste-based information from user prompts in the form of a structured json object.
For example, the user might ask 'I want to eat something that has at least 30g of protein, less than 500 calories, and is pretty spicy.'
The response should be a json object with the following fields:
{{
     "spice_level": {{"min": 3}},
     "calories": {{"max": 500}},
     "protein": {{"min": 30}}
}}
Respond only with the json object and nothing else. If a field is not mentioned in the prompt, it should be omitted from the response.
Here are some examples:
User prompt: "I want a meal with at least 20g of fiber and low sugar."
Response: {{"fiber": {{"min": 20}}, "sugar": {{"max": 10}}}}
User prompt: "Give me a dessert that's not too sweet and has under 300 calories."
Response: {{"sugar": {{"max": 15}}, "calories": {{"max": 300}}}}

If the user prompt is not related to food or nutrition, respond with an empty json object: {{}} and nothing else.

Now, here is the user prompt: {user_prompt}
"""

try:
    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that extracts nutritional requirements from natural language and outputs only valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_tokens=500,
    )

    print("Response from Groq:")
    print(response.choices[0].message.content)
    print("-" * 50)
    print("✅ Test successful!")

except Exception as e:
    print(f"❌ Error: {e}")
