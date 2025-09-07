// Authentication state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log('User is signed in:', user);
        
        // Update UI to show user is logged in
        const userDisplayName = user.displayName || user.email;
        const welcomeElements = document.querySelectorAll('.welcome-section h2');
        welcomeElements.forEach(el => {
            if (el.textContent.includes('Welcome back')) {
                el.textContent = `Welcome back, ${userDisplayName.split(' ')[0]}!`;
            }
        });
    } else {
        // User is signed out
        console.log('User is signed out');
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }
});

// Logout function
function logout() {
    auth.signOut().then(() => {
        console.log('User signed out successfully');
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}

// Login with email and password
function loginWithEmail(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

// Create user with email and password
function signUpWithEmail(email, password, displayName) {
    return auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Update user profile with display name
            return userCredential.user.updateProfile({
                displayName: displayName
            });
        });
}

// Send password reset email
function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
}

// Export functions for use in other files
window.authFunctions = {
    logout,
    loginWithEmail,
    signUpWithEmail,
    resetPassword
};