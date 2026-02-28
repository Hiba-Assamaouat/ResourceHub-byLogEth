// Sign In button pop-up
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

// Google Sign-In callback function
function handleCredentialResponse(response) {
    const jwt = response.credential;
    console.log("Encoded JWT ID token: " + jwt);

    // Send this token to backend for verification
}

