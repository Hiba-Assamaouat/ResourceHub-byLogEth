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
    throw new Error('Failed to fetch news');
  }

  const data = await response.json();
  return data.suggestions;
}

// Example usage in your UI
document.getElementById('fetchButton').addEventListener('click', async () => {
  const topic = document.getElementById('topicInput').value;
  const numSuggestions = document.getElementById('numSuggestionsInput').value;

  try {
    const suggestions = await fetchNewsSuggestions(topic, numSuggestions);
    document.getElementById('suggestionsOutput').innerText = suggestions;
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('suggestionsOutput').innerText = 'Failed to load suggestions.';
  }
});
