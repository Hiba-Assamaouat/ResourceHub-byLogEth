from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from mistralai import Mistral
from dotenv import load_dotenv, find_dotenv
from mistralai.models import Tool, WebSearchTool
import requests



# load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv(find_dotenv(), override=True)
API_KEY = os.getenv("MISTRAL_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

def fetch_real_articles(topic, num_suggestions):
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": topic,
        "pageSize": num_suggestions,
        "sortBy": "publishedAt",
        "language": "en",
        "apiKey": NEWS_API_KEY
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    articles = response.json().get("articles", [])
    
    # Format articles for Mistral
    formatted = ""
    for i, article in enumerate(articles):
        formatted += f"""
        Article {i+1}:
        Title: {article.get('title', 'N/A')}
        Date: {article.get('publishedAt', 'N/A')}
        Source: {article.get('source', {}).get('name', 'N/A')}
        URL: {article.get('url', 'N/A')}
        Description: {article.get('description', 'N/A')}
        """
    return formatted

client = Mistral(api_key=API_KEY)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

@app.route('/fetch-news', methods=['POST'])
def fetch_news():
    data = request.json
    topic = data.get('topic', '')
    num_suggestions = data.get('num_suggestions', 3)

    try:
        #fetch real articles from NewsAPI
        real_articles = fetch_real_articles(topic, num_suggestions)

         # Check if any articles were found
        if not real_articles.strip():
            return jsonify({"suggestions": None, "message": f"No articles found for '{topic}'. Try a broader topic."})

        # pass articles to Mistral for summarization and scoring
        response = client.chat.complete(
            model="mistral-small-latest",
            messages=[
                {
                    "role": "user",
                    "content": f"""
                    Here are {num_suggestions} real news articles about '{topic}'.
                    {real_articles}
                    
                    For each article, provide:
                    1. Title
                    2. Date
                    3. Brief summary
                    4. Source URL
                    5. Reliability score (in %)
                    Format your response as a numbered list.
                    """
                }
            ]
        )
        suggestions = response.choices[0].message.content
        return jsonify({"suggestions": suggestions})
    except Exception as e:
        print("ERROR:", str(e))
        print("RESPONSE:", suggestions)
        return jsonify({"error": str(e)}), 500
    
# @app.route('/fetch-news', methods=['POST'])
# def fetch_news():
#     data = request.json
#     topic = data.get('topic', '')
#     num_suggestions = data.get('num_suggestions', 3)

#     try:
#         response = client.chat.complete(
#             model="mistral-small-latest",
#             messages=[
#                 {
#                     "role": "user",
#                     "content": f"""
#                     You must return EXACTLY {num_suggestions} news articles about '{topic}'. Not more, not less.
#                     Conditions:
#                     - EXCLUSIVELY include articles from February 2026.
#                     - Prioritize reputable sources (TechCrunch, Wired, Reuters).
#                     - If you cannot find enough recent articles, return as many as you can but ABSOLUTELY DO NOT fabricate or repeat articles to meet the quota.
#                     - For each article, provide:
#                       1. Title
#                       2. Date
#                       3. Brief summary
#                       4. EXACT Article Source URL
#                       5. Reliability score (in %)
#                     Format your response as a numbered list.
#                     """
#                 }
#             ]
#         )
#         suggestions = response.choices[0].message.content
#         print("RESPONSE:", suggestions)
#         return jsonify({"suggestions": suggestions})
#     except Exception as e:
#         print("ERROR:", str(e))  # for debugging
#         return jsonify({"error": str(e)}), 500

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