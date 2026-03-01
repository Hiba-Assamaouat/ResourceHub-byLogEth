// Sign In options modal overlay
const openBtn = document.getElementById('openModal');
const overlay = document.getElementById('modalOverlay');
const closeBtn = document.getElementById('closeModal');

openBtn.addEventListener('click', e => {
  e.preventDefault();
  overlay.classList.add('active');
});

closeBtn.addEventListener('click', () => overlay.classList.remove('active'));

overlay.addEventListener('click', e => {
  if (e.target === overlay) overlay.classList.remove('active');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') overlay.classList.remove('active');
});
// =======

document.getElementById('customGoogleBtn').addEventListener('click', function() {
  // Trigger the Google Sign-In popup
  google.accounts.id.prompt();
});

var googleUser = {};
  var startApp = function() {
    gapi.load('auth2', function(){
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      auth2 = gapi.auth2.init({
        client_id: '"584399183954-m8cseh070gd2a0e1quo0h1k3vi3t5k4g.apps.googleusercontent.com"',
        cookiepolicy: 'single_host_origin',
        // Request scopes in addition to 'profile' and 'email'
        //scope: 'additional_scope'
      });
      attachSignin(document.getElementById('customBtn'));
    });
  };

  function attachSignin(element) {
    console.log(element.id);
    auth2.attachClickHandler(element, {},
        function(googleUser) {
          document.getElementById('name').innerText = "Signed in: " +
              googleUser.getBasicProfile().getName();
        }, function(error) {
          alert(JSON.stringify(error, undefined, 2));
        });
  }


// Google Sign-In callback function
function handleCredentialResponse(response) {
    const jwt = response.credential;
    console.log("Encoded JWT ID token: " + jwt);

    // Send this token to backend for verification
}


// --- when modal is opened ---
document.getElementById("customGoogleBtn").addEventListener("click", function() {
  google.accounts.id.prompt(); // This will show the popup
});

// initializeGoogleSignIn();



// ===== API CALLS =====
async function fetchNewsSuggestions(topic, numSuggestions) {
  try {
    const response = await fetch('http://localhost:5000/fetch-news', {
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
  const newsItems = suggestions.split(/\d+\./).filter(item => item.trim() !== '');

  let formattedHTML = '<div class="news-container">';

  newsItems.forEach((item, index) => {
    if (item.trim() === '') return;

    // Extract title (first line)
    const titleMatch = item.match(/^\*\*(.*?)\*\*/);
    const title = titleMatch ? titleMatch[1] : `News Item ${index + 1}`;

    // Extract date, summary, source, and reliability
    const dateMatch = item.match(/Date:\s*(.*?)\n/);
    const summaryMatch = item.match(/Summary:\s*(.*?)\n/);
    const sourceMatch = item.match(/Source:\s*\[(.*?)\]\((.*?)\)/);
    const reliabilityMatch = item.match(/Reliability:\s*(\d+)%/);

    const date = dateMatch ? dateMatch[1] : 'Unknown date';
    const summary = summaryMatch ? summaryMatch[1] : 'No summary available';
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
