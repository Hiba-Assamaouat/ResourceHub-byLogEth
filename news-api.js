

// ===== API CALLS =====
console.log("Script loaded!"); 

async function fetchNewsSuggestions(topic, numSuggestions) {
  try {
    const response = await fetch('http://localhost:5001/fetch-news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topic,
        num_suggestions: numSuggestions,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.suggestions;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

// Format the news suggestions for better readability
function formatNewsSuggestions(suggestions) {
  // Split the suggestions into an array of news items
  const newsItems = suggestions.split(/\n\s*\d+\./).filter(item => item.trim() !== '' && item.includes('**Title**'));
  
  let formattedHTML = '<div class="news-container">';

  newsItems.forEach((item, index) => {
    if (item.trim() === '') return;

    
    const titleMatch = item.match(/\*\*Title\*\*:\s*"?([^"\n]+)"?/);
    const dateMatch = item.match(/\*\*Date\*\*:\s*([^\n]+)/);
    const summaryMatch = item.match(/\*\*Summary\*\*:\s*([^\n]+)/);
    const sourceMatch = item.match(/\*\*Source URL\*\*:\s*\[([^\]]+)\]\(([^)]+)\)/);
    const reliabilityMatch = item.match(/\*\*Reliability Score\*\*:\s*(\d+)%/);

    const title = titleMatch ? titleMatch[1].trim() : `News Item ${index + 1}`;
    const date = dateMatch ? dateMatch[1].trim() : 'Unknown date';
    const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary available';
    const sourceName = sourceMatch ? sourceMatch[1] : 'Unknown source';
    const sourceURL = sourceMatch ? sourceMatch[2] : '#';
    const reliability = reliabilityMatch ? reliabilityMatch[1] : 'N/A';

    formattedHTML += `
      <div class="news-item">
        <h3>${title}</h3>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Summary:</strong> ${summary}</p>
        <p><strong>Source:</strong> <a href="${sourceURL}" target="_blank">${sourceName}</a></p>
        <p><strong>Reliability:</strong> ${reliability}%</p>
      </div>
    `;
  });

  formattedHTML += '</div>';
  return formattedHTML;
}

// Example usage in your UI
document.getElementById('fetchButton').addEventListener('click', async () => {
  console.log("Button clicked!");  // for debugginf purposes
  
  const topicInput = document.getElementById('topicInput');
  const numSuggestionsInput = document.getElementById('numSuggestionsInput');
  const suggestionsOutput = document.getElementById('suggestionsOutput');

  const topic = topicInput.value.trim();
  const numSuggestions = parseInt(numSuggestionsInput.value) || 3;

  if (!topic) {
    suggestionsOutput.innerHTML = '<p class="error">Please enter a topic.</p>';
    return;
  }

  try {
    suggestionsOutput.innerHTML = '<p>Loading news suggestions...</p>';
    const suggestions = await fetchNewsSuggestions(topic, numSuggestions);
    suggestionsOutput.innerHTML = formatNewsSuggestions(suggestions);
  } catch (error) {
    console.error('Error:', error);
    suggestionsOutput.innerHTML = '<p class="error">Failed to load suggestions. Please try again.</p>';
  }
});
