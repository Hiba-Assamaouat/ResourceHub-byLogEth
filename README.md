# Resource Hub - A LogEth Project

This project is a part of the 2026 [Mistral AI](https://mistral.ai/) Online Hackathon, hosted by [Iterate](https://hackiterate.com/)

| Mistral AI Hackathon 2026 |                        |
| --- | --- |
| Team name    | Logos et Ethos (aka _LogEth_)      |
| Team members | Hiba Assamaouat <br> Ismail Assamaouat |

---

### Definition
Resource hub for young professionals and students to encourage growth towards the numeric transition. A website to gather tech afficionados and professionals, a space for exchange and learning.

This page is a __moderated community-centered platform__.
  users will find resources including:
  1. Existing hubs in the different cities where they can learn skills
  2. Find out about upcoming events (networking events, hackathons, meetups, career fairs)
  3. Read resource articles about various topics (job seeking, startup building, university applications)
  4. Explore opportunities in the countries and abroad with useful information and links
  5. Access to the latest news and tech advancements in the country and around the world

  * users would also have the option to sign in and leave reviews of events and locations, send suggestions, submit event/meetup proposals.

--- 

The chosen track for this online hackathon is "Use Mistral models through the API or OSS tools to create the best demos."

This will be essentially applied for point `[5]` from the feature list above where the moderator(s)/admin can work with Mistral's API to receive personalized news content suggestions of the week/day in order to facilitate and automate the research part while having an eagle view over the sources to choose from to ensure validity and to diminish misinformation. 

---

Frontend - HTML | CSS | JavaScript <br>
Backend - Python | Flask | Firebase

---
Quick UI setup

1. Provisional Palette<br>
<img src="/images/Palette.png" alt="provisional palette" width="500" height="300">

2. Tab selection is initially as follows<br>
| Home | Events | Spots | Articles | The Latest | Contact | **Sign Up** |

3. Footer will compile a copyright, the tab links, external links to alternate platforms, and a link to the admin portal 


--- 
About the User Sign In Portal

&rarr; for the time-being, sign in will be only powered by Google

---
*__About the Admin Portal__*

&rarr; access requires a sign in with an admin password

This interface, initially, will mainly be for the news recommendation using the Mistral API.<br>
Further down the line, this page will also allow admin to visualize activity and performance data of the website.

For the tech news agent, we are using the Mistral API key provided by the hackathon organizers.

 *Update*: the key did not work for some reason, a new key was retrieved via [console.mistral.ai](https://console.mistral.ai/)

The script to run the agent was written on Python.

Mistral's Agent Endpoints were used (see [mistral documentation](https://docs.mistral.ai/api/endpoint/agents))

And to enhance the search, an additional api, specific to news search, was added. It is called [NewsApi](https://newsapi.org/). We initially attempted to make it work without this api, trying to make the Mistral API retrieve data directly from the `WebSearchTool` from the mistralai models, however errors kept emerging and could not be debugged with the amount of skill we have.

Therefore, we end up with NewsAPI fetching real articles, then Mistral processing and summarizing them.

Using Flask, the backend manages admin requests and coordinates communication between the News API and Mistral API to fetch and process curated tech articles.

Some technical issues encountered included:
- a port conflict on CORS (we ended up replacing port 5000 to 5001 due to macOS Airplay conflict).
- The `WebSearchTool` from the mistralai SDK could not be properly formatted to pass validation, despite multiple attempts with different tool formats and direct API calls.
- The `.env` file was not being reliably picked up by `load_dotenv`, causing the API key to not load correctly until `override=True` and `find_dotenv()` were explicitly used.

Limitations:
- Mistral API operating alone would invent news just to abide by the set requirements.
- Although News API solved the issue by fetching actual articles, the api's search requirements could not be customized as freely as with Mistral only, therefore the outputs (the returned articles) often were far-fetched and unrelated to requested topics and themes.
- NewsAPI's free tier limits coverage of non-English and regional sources, making it difficult to surface news specific to a country or region.
- the number of daily requests on news api on the free tier is capped, which limits scalability.

Future Improvements:
- Testing out another API with richer filtering options (by region, language, and domain) to overcome the relevance limitations described above.
- Gaining access to a higher Mistral API tier to properly leverage the WebSearchTool for real-time search on the worldwide web.
- Fine-tuning our own model just for tech-related news.
- Adding a database to persist fetched articles and avoid redundant API calls.

Despite the technical hurdles encountered, the project successfully demonstrates a functional AI-powered news fetching pipeline that combines real article retrieval with intelligent summarization. The debugging process itself was a valuable learning experience. What started as a simple idea quickly revealed the complexity of building with real APIs under real constraints. All in all, this hackathon was a way for us to push ourselves and to explore a domain that isn't our specialties (relatively far from it in fact).

[Link to video demo](https://youtu.be/_N4wcFFfdbo)
