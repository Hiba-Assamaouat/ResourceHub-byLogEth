

// Google Sign-In callback function
function handleCredentialResponse(response) {
    const jwt = response.credential;
    console.log("Encoded JWT ID token: " + jwt);

    // Send this token to backend for verification
}