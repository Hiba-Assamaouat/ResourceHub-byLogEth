# Flask backend for fetching news suggestions using Mistral API

# API key is storedin the .env file and .env is added to .gitignore to avoid exposing it in version control.

#!/usr/bin/env python3

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv
from mistralai import Mistral


#env variables
load_dotenv()
API_KEY = os.getenv("MISTRAL_API_KEY")

client = Mistral(api_key=API_KEY)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

news_agent_id = None # in reality, we would need a database to store the agent ID and reuse it across requests but for simplicity, we will create a new agent on each run.

def create_news_agent():
    """Creates a news-fetching agent with web search capabilities."""
    global news_agent_id
    agent = client.beta.agents.create(
        model="mistral-medium-latest",
        name="Tech News Fetcher",
        description="An agent that fetches and summarizes the latest tech news based on user queries.",
        tools=[{"type": "web_search"}]  # Enable web search for up-to-date news
    )
    news_agent_id = agent.id
    return agent.id


@app.route('/fetch-news', methods=['POST'])
def fetch_news():
    global news_agent_id

    # Create the agent if it doesn't exist
    if not news_agent_id:
        create_news_agent()

    data = request.json
    topic = data.get('topic', '')
    num_suggestions = data.get('num_suggestions', 3)

    try:
        response = client.beta.agents.complete(
            agent_id=news_agent_id,
            messages=[
                {
                    "role": "user",
                    "content": f"""
                    Fetch the latest {num_suggestions} news articles about '{topic}'.
                    Conditions:
                    - Only include articles from the last 7 days.
                    - Prioritize reputable sources like TechCrunch, Wired, or Reuters.
                    - For each article, provide:
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
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)