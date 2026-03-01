#!/usr/bin/env python3

import os
import requests
from dotenv import load_dotenv
from mistralai import Mistral

# Load the API key from the .env file
load_dotenv()
API_KEY = os.getenv("MISTRAL_API_KEY")

client = Mistral(api_key=API_KEY)

# Using Mistral's API Agent as explained here https://docs.mistral.ai/api/endpoint/agents

def create_news_agent():
    """
    Creates a news-fetching agent with web search capabilities.
    """
    agent = client.beta.agents.create(
        model="mistral-medium-latest",  # latest model
        name="Tech News Fetcher",
        description="An agent that fetches and summarizes the latest tech news based on user queries.",
        tools=[{"type": "web_search"}]  # enable web search for up-to-date news
    )
    return agent

def fetch_news(agent_id, topic, num_suggestions=3):
    """
    Fetches news using the agent.
    """
    response = client.beta.agents.complete(
        agent_id=agent_id,
        messages=[
            {
                "role": "user",
                "content": f"""
                Fetch the latest {num_suggestions} news articles about '{topic}'.
                Conditions:
                - Only include articles from the last 7 days.
                - Prioritize reputable sources like TechCrunch, Wired, or Reuters for international tech news, and TelQuel, Morocco World News, or Hespress for local Moroccan tech news.
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
    return response.choices[0].message.content

# Example usage
if __name__ == "__main__":
    # Create or reuse an agent
    agent = create_news_agent()
    print(f"Created agent with ID: {agent.id}")

    # Fetch news
    topic = input("Enter the news topic you're interested in (e.g., 'AI ethics'): ")
    num_suggestions = int(input("How many suggestions do you want? (e.g., 3): "))
    news = fetch_news(agent.id, topic, num_suggestions)
    print("\nHere are your news suggestions:\n")
    print(news)

