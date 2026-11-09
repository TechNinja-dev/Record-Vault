// frontend/Auth/auth.js
// Handles client-side UI interactions & Firebase Authentication for Login & Register.

// Firebase configuration using keys from .env
const firebaseConfig = {
  apiKey: "AIzaSyDlvVa5C_oIqaeQvTlvhs7-EBq9xATOdmM",
  authDomain: "record-vault-4c399.firebaseapp.com",
  projectId: "record-vault-4c399",
  storageBucket: "record-vault-4c399.firebasestorage.app",
  messagingSenderId: "668765656302",
  appId: "1:668765656302:web:368356a9ca65775ce2cfff",
  measurementId: "G-LC1WSKCTGE"
};

// Initialize Firebase client app if Firebase SDK is present and not already initialized
function ensureFirebaseInitialized() {
  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ensureFirebaseInitialized();
  initPasswordToggles();
  initFormPlaceholders();
  initGoogleAuth();
});

/**
 * Initializes eye icon toggle for showing/hiding password inputs
 */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.btn-toggle-password');

  toggleButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-toggle-target');
      if (!targetId) return;

      const input = document.getElementById(targetId);
      if (!input) return;

      const eyeOpen = btn.querySelector('.icon-eye-open');
      const eyeClosed = btn.querySelector('.icon-eye-closed');

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      if (eyeOpen && eyeClosed) {
        eyeOpen.classList.toggle('hidden', isPassword);
        eyeClosed.classList.toggle('hidden', !isPassword);
      }
    });
  });
}

let isAuthHandling = false;

/**
 * Submits the authenticated user ID token to the backend, saves session, and redirects
 */
async function handleAuthenticatedUser(user) {
  if (!user || isAuthHandling) return;
  isAuthHandling = true;

  console.log('Firebase user successfully authenticated:', user.email);

  try {
    const idToken = await user.getIdToken();
    console.log('Sending ID Token to backend at http://127.0.0.1:8000/auth/google_auth...');

    let backendUserData = null;
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/google_auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: idToken })
      });

      if (response.ok) {
        const res = await response.json();
        console.log('Backend authentication response:', res);
        if (res && res.data) {
          backendUserData = res.data;
        }
      } else {
        console.warn('Backend responded with HTTP status:', response.status);
      }
    } catch (backendErr) {
      console.warn('Backend verification call warning:', backendErr);
    }

    // Store authenticated user session in localStorage
    const authSession = {
      uid: backendUserData?.uid || user.uid,
      name: backendUserData?.name || user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
      email: backendUserData?.email || user.email || '',
      photoURL: backendUserData?.picture || user.photoURL || ''
    };

    localStorage.setItem('auth', JSON.stringify(authSession));
    console.log('User session saved in localStorage. Redirecting to home...');

    window.location.href = '../Home/home.html';
  } catch (err) {
    console.error('Error handling authenticated user:', err);
    isAuthHandling = false;
  }
}

/**
 * Google Auth Popup Provider integration with onAuthStateChanged fallback
 */
function initGoogleAuth() {
  const googleBtn = document.getElementById('btn-google-auth');
  if (!googleBtn) return;

  ensureFirebaseInitialized();

  let isGoogleBtnClicked = false;

  // Listen for auth state change — this works even if COOP blocks window.closed polling!
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user && isGoogleBtnClicked) {
        console.log('onAuthStateChanged triggered for Google login:', user.email);
        handleAuthenticatedUser(user);
      }
    });
  }

  googleBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (typeof firebase === 'undefined' || !firebase.auth) {
      alert('Firebase SDK is loading or unavailable. Please ensure you are connected to the internet.');
      return;
    }

    ensureFirebaseInitialized();
    isGoogleBtnClicked = true;

    const originalContent = googleBtn.innerHTML;
    googleBtn.disabled = true;
    googleBtn.classList.add('opacity-75', 'cursor-not-allowed');
    googleBtn.innerHTML = `
      <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Connecting with Google...</span>
    `;

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'select_account' });

      // Trigger Firebase popup
      const result = await firebase.auth().signInWithPopup(provider);
      if (result && result.user) {
        await handleAuthenticatedUser(result.user);
      }
    } catch (error) {
      console.warn('Google Sign-In Popup event:', error);

      // If user dismissed popup window
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        isGoogleBtnClicked = false;
        googleBtn.disabled = false;
        googleBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        googleBtn.innerHTML = originalContent;
      } else {
        // Even if popup polling failed due to COOP, check if user successfully signed in
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
          await handleAuthenticatedUser(currentUser);
        } else {
          isGoogleBtnClicked = false;
          googleBtn.disabled = false;
          googleBtn.classList.remove('opacity-75', 'cursor-not-allowed');
          googleBtn.innerHTML = originalContent;
          alert('Google Sign-in failed: ' + (error.message || 'Unknown error'));
        }
      }
    }
  });
}

/**
 * Form submit stubs for standard email/password authentication
 */
function initFormPlaceholders() {
  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());
      console.log('Login submitted:', { email: data.email, remember: !!data.remember });
    });
  }

  const registerForm = document.getElementById('form-register');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      const data = Object.fromEntries(formData.entries());

      if (data.password !== data.confirm_password) {
        alert('Passwords do not match. Please verify your password.');
        return;
      }

      console.log('Register submitted:', { name: data.name, email: data.email });
    });
  }
}
