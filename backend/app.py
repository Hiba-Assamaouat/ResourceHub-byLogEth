from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from mistralai import Mistral
from dotenv import load_dotenv, find_dotenv
from mistralai.models import Tool, WebSearchTool



# load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv(find_dotenv(), override=True)
API_KEY = os.getenv("MISTRAL_API_KEY")

print("API KEY loaded:", bool(API_KEY))

client = Mistral(api_key=API_KEY)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

@app.route('/fetch-news', methods=['POST'])
def fetch_news():
    data = request.json
    topic = data.get('topic', '')
    num_suggestions = data.get('num_suggestions', 3)

    try:
        response = client.chat.complete(
            model="mistral-small-latest",
            messages=[
                {
                    "role": "user",
                    "content": f"""
                    You must return EXACTLY {num_suggestions} news articles about '{topic}'. Not more, not less.
                    Conditions:
                    - EXCLUSIVELY include articles from February 2026.
                    - Prioritize reputable Moroccan sources (TelQuel, Morocco World News, Hespress), LinkedIn posts, and ONLY if not enough recent articles are found should you suggest international sources (TechCrunch, Wired, Reuters).
                    - If you cannot find enough recent articles, return as many as you can but ABSOLUTELY DO NOT fabricate or repeat articles to meet the quota.
                    - For each article, provide:
                      1. Title
                      2. Date
                      3. Brief summary
                      4. EXACT Article Source URL
                      5. Reliability score (in %)
                    Format your response as a numbered list.
                    """
                }
            ]
        )
        suggestions = response.choices[0].message.content
        print("RESPONSE:", suggestions)
        return jsonify({"suggestions": suggestions})
    except Exception as e:
        print("ERROR:", str(e))  # for debugging
        return jsonify({"error": str(e)}), 500

@app.route('/test-key', methods=['GET'])
def test_key():
    try:
        response = client.chat.complete(
            model="mistral-small-latest",
            messages=[{"role": "user", "content": "say hello"}]
        )
        return jsonify({"result": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)