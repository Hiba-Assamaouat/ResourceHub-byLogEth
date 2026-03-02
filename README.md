# Resource Hub - Morocco - A LogEth Project

This project is a part of the 2026 [Mistral AI](https://mistral.ai/) Online Hackathon, hosted by [Iterate](https://hackiterate.com/)

| Mistral AI Hackathon 2026 |                        |
| --- | --- |
| Team name    | Logos et Ethos (aka _LogEth_)      |
| Team members | Hiba Assamaouat <br> Ismail Assamaouat |

---

### Definition
Resource hub for young professionals and students across the Kingdom of Morocco to encourage growth towards the numeric transition. A website to gather tech afficionados and professionals, a space for exchange and learning.

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
About the Admin Portal

&rarr; access requires a sign in with an admin password

This interface, initially, will mainly be for the news recommendation using the Mistral API.<br>
Further down the line, this page will also allow admin to visualize activity and performance data of the website.

For the tech news agent, we are using the Mistral API key provided by the hackathon organizers.

 Update: the key did not work for some reason, a ew key was retrieved via [console.mistral.ai](https://console.mistral.ai/)

The script to run the agent was written on Python.