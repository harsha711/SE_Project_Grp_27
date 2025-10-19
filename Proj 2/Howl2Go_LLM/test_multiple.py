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

base_prompt = """Your goal is to extract nutritional information only from user prompts in the form of a structured JSON object.

The JSON object can only contain the following keys:
calories
caloriesFromFat
totalFat
saturatedFat
transFat
cholesterol
sodium
carbs
fiber
sugars
protein

Each key may have a nested object specifying "min" or "max" values (for example, "protein": {{"min": 30}}).

If a nutrient is not mentioned or cannot be inferred from the user prompt, omit it from the JSON object.
You must only include keys from the list above. Do not add any other fields under any circumstances. Ignore non-nutritional attributes such as taste, spice level, texture, flavor, or temperature, even if mentioned.
You should also handle common synonyms or variants by mapping them to the correct key:
"fat" or "fats" → "totalFat"
"saturated" or "saturated fats" → "saturatedFat"
"trans" or "trans fats" → "transFat"
"cholesterol" → "cholesterol"
"salt" → "sodium"
"carbohydrates" or "carbohydrate" → "carbs"
"fiber" or "fibre" → "fiber"
"sugar" or "sweetness" → "sugars"
"protein" or "proteins" → "protein"
"calorie" or "energy" → "calories"
"calories from fat" → "caloriesFromFat"

If the user prompt is not related to food or nutrition at all, respond with an empty JSON object: {{}}
Your responses must always be a valid JSON object and must never contain any text or explanation.

Examples:

User prompt:
"I want a meal with at least 20g of fiber and low sugar."
Response:
{{"fiber": {{"min": 20}}, "sugars": {{"max": 10}}}}

User prompt:
"Give me a dessert that's under 300 calories and low in fat."
Response:
{{"calories": {{"max": 300}}, "totalFat": {{"max": 10}}}}

User prompt:
"I want something spicy with lots of protein."
Response:
{{"protein": {{"min": 20}}}}

User prompt:
"Tell me a joke."
Response:
{{}}

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
