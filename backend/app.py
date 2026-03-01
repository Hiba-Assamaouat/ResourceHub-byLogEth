# Flask backend for fetching news suggestions using Mistral API

# API key is storedin the .env file and .env is added to .gitignore to avoid exposing it in version control.

#!/usr/bin/env python3

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
API_KEY = os.getenv("MISTRAL_API_KEY")
API_URL = "https://api.mistral.ai/v1/chat/completions"  # Verify in Mistral docs

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/fetch-news', methods=['POST'])
def fetch_news():
    data = request.json
    topic = data.get('topic', '')
    num_suggestions = data.get('num_suggestions', 3)

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""
    Act as a tech news assistant.
    Suggest {num_suggestions} engaging and recent news topics about '{topic}'.
    For each topic, provide a headline and a one-sentence summary.
    Format your response as a numbered list.
    """

    payload = {
        "model": "mistral-small",
        "messages": [{"role": "user", "content": prompt}]
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
        suggestions = response.json()["choices"][0]["message"]["content"]
        return jsonify({"suggestions": suggestions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
