#!/usr/bin/env python3

import os
import requests
from dotenv import load_dotenv

# Load the API key from the .env file
load_dotenv()
API_KEY = os.getenv("MISTRAL_API_KEY")

# Mistral API endpoint (check the docs for the correct URL)
API_URL = "https://api.mistral.ai/v1/chat/completions"  # Example; verify in the docs

def fetch_news_suggestions(topic, num_suggestions=3):
    """
    Fetches news suggestions from Mistral's AI for a given topic.
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    # Customize the prompt to ask for news suggestions
    prompt = f"""
    Act as a tech news assistant.
    Suggest {num_suggestions} engaging and recent news topics about '{topic}'.
    For each topic, provide a brief one-sentence description and a list of reliable sources to verify the information.
    Format your response as a numbered list.
    """

    data = {
        "model": "mistral-small",  # Use the model recommended in the docs
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post(API_URL, headers=headers, json=data)
        response.raise_for_status()  # Raise an error for bad status codes
        suggestions = response.json()["choices"][0]["message"]["content"]
        return suggestions
    except requests.exceptions.RequestException as e:
        return f"Error fetching news: {e}"

# Example usage
if __name__ == "__main__":
    topic = input("Enter the news topic you're interested in (e.g., 'AI ethics'): ")
    num_suggestions = int(input("How many suggestions do you want? (e.g., 3): "))
    suggestions = fetch_news_suggestions(topic, num_suggestions)
    print("\nHere are your news suggestions:\n")
    print(suggestions)
