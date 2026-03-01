// ============================================================
//  1-events.js  —  Events page Mistral AI integration
//  Fetches tech events based on user filters using Mistral API
// ============================================================

import { MISTRAL_API_KEY } from "./config.js";

const MISTRAL_MODEL   = "mistral-large-latest";
const MISTRAL_URL     = "https://api.mistral.ai/v1/chat/completions";


// ── DOM refs ─────────────────────────────────────────────────
const fetchBtn     = document.getElementById("fetchEventsBtn");
const eventsGrid   = document.getElementById("eventsGrid");
const eventsEmpty  = document.getElementById("eventsEmpty");
const eventsStatus = document.getElementById("eventsStatus");
const eventsLoading = document.getElementById("eventsLoading");

const topicInput   = document.getElementById("topicFilter");
const dateFrom     = document.getElementById("dateFrom");
const dateTo       = document.getElementById("dateTo");
const eventCount   = document.getElementById("eventCount");


// ── Set default dates (today → +3 months) ───────────────────
const today = new Date();
const threeMonths = new Date();
threeMonths.setMonth(today.getMonth() + 3);

dateFrom.value = today.toISOString().split("T")[0];
dateTo.value   = threeMonths.toISOString().split("T")[0];


// ── Main fetch handler ───────────────────────────────────────
fetchBtn.addEventListener("click", fetchEvents);

async function fetchEvents() {
  const topic  = topicInput.value.trim() || "tech, AI, coding, hackathons";
  const from   = dateFrom.value || today.toISOString().split("T")[0];
  const to     = dateTo.value   || threeMonths.toISOString().split("T")[0];
  const count  = Math.min(Math.max(parseInt(eventCount.value) || 6, 1), 20);

  if (!MISTRAL_API_KEY) {
    showStatus("⚠️ No Mistral API key found. See setup instructions in 1-events.js.", true);
    return;
  }

  // UI: loading state
  setLoading(true);
  showStatus(`Searching for ${count} ${topic} events between ${formatDate(from)} and ${formatDate(to)}…`);

  try {
    const prompt = buildPrompt(topic, from, to, count);
    const raw    = await callMistral(prompt);
    const events = parseEvents(raw);

    if (!events || events.length === 0) {
      showStatus("No events found for those filters. Try broadening your search.", true);
      setLoading(false);
      return;
    }

    renderEvents(events);
    showStatus(`Found ${events.length} event${events.length !== 1 ? "s" : ""} — updated ${new Date().toLocaleTimeString()}`);

  } catch (err) {
    console.error("Mistral fetch error:", err);
    showStatus("Something went wrong fetching events. Check your API key and try again.", true);
  }

  setLoading(false);
}


// ── Build the prompt ─────────────────────────────────────────
function buildPrompt(topic, from, to, count) {
  return `You are a tech events research assistant. Your job is to provide real, accurate information about tech events.

Find ${count} real tech events related to "${topic}" that are either ongoing or upcoming between ${from} and ${to}.

Focus on: hackathons, tech conferences, developer meetups, coding competitions, AI/ML summits, open source events.

Respond ONLY with a valid JSON array. No markdown, no explanation, just the raw JSON array.

Each object must have exactly these fields:
- "name": string — full event name
- "status": "ongoing" or "upcoming"
- "dateStart": string — start date in YYYY-MM-DD format
- "dateEnd": string — end date in YYYY-MM-DD format (same as start if one day)
- "location": string — city + country, or "Online" if virtual
- "description": string — 2 sentences max describing the event
- "tags": array of 2-4 short topic strings (e.g. ["AI", "Hackathon", "Open Source"])
- "registerUrl": string — real registration/info URL, or "" if unknown

Example format:
[
  {
    "name": "ETHGlobal London 2025",
    "status": "upcoming",
    "dateStart": "2025-03-14",
    "dateEnd": "2025-03-16",
    "location": "London, UK",
    "description": "A 36-hour Ethereum hackathon bringing together developers to build decentralised applications. Participants compete for prizes across multiple sponsor tracks.",
    "tags": ["Web3", "Hackathon", "Ethereum"],
    "registerUrl": "https://ethglobal.com/events/london2025"
  }
]

Now return ${count} events matching: topic="${topic}", between ${from} and ${to}.`;
}


// ── Call Mistral API ─────────────────────────────────────────
async function callMistral(prompt) {
  const response = await fetch(MISTRAL_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model:       MISTRAL_MODEL,
      temperature: 0.3,  // lower = more factual
      max_tokens:  4000,
      messages: [
        {
          role:    "user",
          content: prompt,
        }
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message ?? `Mistral API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}


// ── Parse JSON response ──────────────────────────────────────
function parseEvents(raw) {
  try {
    // Strip any accidental markdown code fences
    const cleaned = raw.replace(/```json|```/gi, "").trim();
    const parsed  = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to parse Mistral response:", raw);
    return [];
  }
}


// ── Render event cards ───────────────────────────────────────
function renderEvents(events) {
  // Remove empty state + old cards, keep the empty div in DOM
  eventsEmpty.classList.add("hidden");
  // Clear previous results
  Array.from(eventsGrid.querySelectorAll(".event-card")).forEach(c => c.remove());

  events.forEach((ev, i) => {
    const card = buildCard(ev, i);
    eventsGrid.appendChild(card);
  });
}

function buildCard(ev, index) {
  const card = document.createElement("div");
  card.className = "event-card";
  card.style.animationDelay = `${index * 0.05}s`;

  const statusClass = ev.status === "ongoing" ? "ongoing" : "upcoming";
  const statusLabel = ev.status === "ongoing" ? "Ongoing" : "Upcoming";

  const dateLabel = ev.dateStart === ev.dateEnd
    ? formatDate(ev.dateStart)
    : `${formatDate(ev.dateStart)} – ${formatDate(ev.dateEnd)}`;

  const tagsHTML = (ev.tags ?? [])
    .map(t => `<span class="event-tag">${escHtml(t)}</span>`)
    .join("");

  const linkHTML = ev.registerUrl
    ? `<a href="${escHtml(ev.registerUrl)}" target="_blank" rel="noopener" class="event-register-link">
        Register / Learn more
        <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
       </a>`
    : `<span class="event-no-link">No registration link available</span>`;

  card.innerHTML = `
    <div class="event-card-header">
      <h3 class="event-name">${escHtml(ev.name)}</h3>
      <span class="event-status-badge ${statusClass}">${statusLabel}</span>
    </div>

    <div class="event-meta">
      <div class="event-meta-row">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        ${escHtml(dateLabel)}
      </div>
      <div class="event-meta-row">
        <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${escHtml(ev.location ?? "Location TBC")}
      </div>
    </div>

    <p class="event-description">${escHtml(ev.description ?? "")}</p>

    <div class="event-tags">${tagsHTML}</div>

    ${linkHTML}
  `;

  return card;
}


// ── UI helpers ───────────────────────────────────────────────
function setLoading(on) {
  fetchBtn.disabled = on;
  fetchBtn.textContent = on ? "Searching…" : "";

  if (!on) {
    // Restore button content with icon
    fetchBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      Find Events`;
  }

  eventsLoading.classList.toggle("hidden", !on);
}

function showStatus(msg, isError = false) {
  eventsStatus.textContent = msg;
  eventsStatus.className   = "events-status" + (isError ? " error" : "");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function escHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


// ============================================================
//  HOW TO SET YOUR MISTRAL API KEY
//  ─────────────────────────────────────────────────────────
//  Create a file called  config.js  in your project root
//  and add it to .gitignore so it's never committed.
//
//  config.js contents:
//    window.MISTRAL_API_KEY = "your_mistral_key_here";
//
//  Then add this line to the <head> of 1-events.html
//  BEFORE the 1-events.js script tag:
//    <script src="./config.js"></script>
//
//  That's it — the key is never in any committed file.
// ============================================================