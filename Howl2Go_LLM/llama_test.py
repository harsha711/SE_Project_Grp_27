import ollama

client = ollama.Client()

model = "llama3" #8B parameters

user_prompt = input("Enter your nutritional requirements: ")
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

response = client.generate(model=model, prompt=prompt)
print(response.response)