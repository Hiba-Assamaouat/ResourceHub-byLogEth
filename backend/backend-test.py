import requests

response = requests.post(
    "http://127.0.0.1:5000/fetch-news",
    json={"topic": "AI ethics", "num_suggestions": 3}
)
print(response.json())
