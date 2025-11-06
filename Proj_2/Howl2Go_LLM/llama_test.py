import os
from groq import Groq

# Initialize Groq client with API key from environment variable
# Set GROQ_API_KEY in your environment: export GROQ_API_KEY="your-key-here"
api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    raise ValueError(
        "GROQ_API_KEY environment variable is not set.\n"
        "Please set it using: export GROQ_API_KEY='your-key-here'"
    )

client = Groq(api_key=api_key)

model = "llama-3.1-8b-instant"  # Llama 3.1 8B running on Groq cloud (updated model)

user_prompt = input("Enter your nutritional requirements: ")
prompt = f"""Your goal is to extract nutritional information only from user prompts in the form of a structured JSON object.

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

Each key may have a nested object specifying "min", "max", or both (for example, "protein": {{"min": 30}} or "calories": {{"min": 400, "max": 600}}).

If a nutrient is not mentioned or cannot be inferred from the user prompt, omit it from the JSON object.
You must only include keys from the list above. Do not add any other fields under any circumstances.
Ignore non-nutritional attributes such as taste, spice level, texture, flavor, or temperature, even if mentioned.

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

Assume these default units (convert if necessary):
calories → kcal
fats/protein/carbs/fiber/sugars → grams (g)
sodium/cholesterol → milligrams (mg)

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
"Between 400-500 calories, high protein, no sugar."
Response:
{{"calories": {{"min": 400, "max": 500}}, "protein": {{"min": 20}}, "sugars": {{"max": 0}}}}

User prompt:
"Tell me a joke."
Response:
{{}}

Now, here is the user prompt: {user_prompt}
"""

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
    temperature=0.1,  # Low temperature for more consistent JSON output
    max_tokens=500,
)

print(response.choices[0].message.content)