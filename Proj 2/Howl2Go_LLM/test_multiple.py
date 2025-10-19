import os
from groq import Groq
import json

# Initialize Groq client with API key from environment variable
api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    raise ValueError(
        "GROQ_API_KEY environment variable is not set.\n"
        "Please set it using: export GROQ_API_KEY='your-key-here'"
    )

client = Groq(api_key=api_key)
model = "llama-3.1-8b-instant"

# Test cases
test_prompts = [
    "I want a high protein meal with low carbs",
    "Give me something spicy with under 500 calories",
    "I need a meal with at least 20g of fiber and low sugar",
    "Show me a dessert that's not too sweet and has under 300 calories",
    "What's the weather today?",  # Non-food query
    "I want something with at least 30g protein, less than 500 calories, and pretty spicy"
]

base_prompt = """Your goal is to extract nutritional and taste-based information from user prompts in the form of a structured json object.
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

print("=" * 70)
print("Testing Groq Nutritional Extraction")
print("=" * 70)

for i, user_prompt in enumerate(test_prompts, 1):
    print(f"\n[Test {i}]")
    print(f"Input: {user_prompt}")

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
                    "content": base_prompt.format(user_prompt=user_prompt)
                }
            ],
            temperature=0.1,
            max_tokens=500,
        )

        result = response.choices[0].message.content
        print(f"Output: {result}")

        # Validate JSON
        try:
            parsed = json.loads(result)
            print(f"✓ Valid JSON")
        except:
            print(f"✗ Invalid JSON")

    except Exception as e:
        print(f"❌ Error: {e}")

    print("-" * 70)

print("\n✅ All tests completed!")
