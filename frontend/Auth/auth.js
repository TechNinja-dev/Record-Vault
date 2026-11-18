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
    console.log('User session saved in localStorage.');

    if (backendUserData && backendUserData.needs_password) {
      console.log('Google user has no password set. Showing create password modal...');
      showCreatePasswordModal(authSession.uid, () => {
        window.location.href = '../Home/home.html';
      });
    } else {
      console.log('Redirecting to home...');
      window.location.href = '../Home/home.html';
    }
  } catch (err) {
    console.error('Error handling authenticated user:', err);
    isAuthHandling = false;
  }
}

/**
 * Modal prompt to create a password for first-time or passwordless Google Auth users
 */
function showCreatePasswordModal(uid, onComplete) {
  const existingModal = document.getElementById('modal-create-password');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-create-password';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4';
  modal.innerHTML = `
    <div class="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl transition-all">
      <div class="text-center mb-5">
        <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Create a Password</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Set a password so you can also log in manually using your email anytime.
        </p>
      </div>

      <form id="form-create-password-modal" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">New Password</label>
          <input type="password" id="modal-new-pwd" required minlength="6" placeholder="At least 6 characters" class="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Confirm Password</label>
          <input type="password" id="modal-confirm-pwd" required minlength="6" placeholder="Re-enter password" class="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div id="modal-pwd-error" class="hidden text-xs text-rose-500 font-medium"></div>
        <div class="flex items-center gap-3 pt-2">
          <button type="button" id="btn-skip-create-pwd" class="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            Skip for now
          </button>
          <button type="submit" id="btn-submit-create-pwd" class="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition">
            Set Password
          </button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const form = document.getElementById('form-create-password-modal');
  const skipBtn = document.getElementById('btn-skip-create-pwd');
  const errorEl = document.getElementById('modal-pwd-error');
  const submitBtn = document.getElementById('btn-submit-create-pwd');

  skipBtn.addEventListener('click', () => {
    modal.remove();
    onComplete();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const p1 = document.getElementById('modal-new-pwd').value;
    const p2 = document.getElementById('modal-confirm-pwd').value;

    if (p1 !== p2) {
      errorEl.textContent = 'Passwords do not match.';
      errorEl.classList.remove('hidden');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/create_pwd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: uid, password: p1 })
      });
      const res = await response.json();
      console.log('Password set response:', res);
    } catch (err) {
      console.warn('Failed to call create_pwd:', err);
    }

    modal.remove();
    onComplete();
  });
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

    ensureFirebaseInitialized();

    if (typeof firebase === 'undefined' || !firebase.auth) {
      alert('Firebase SDK is loading or unavailable. Please ensure you are connected to the internet.');
      return;
    }
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
 * Form submit handlers for standard email/password authentication
 */
function initFormPlaceholders() {
  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-login-submit');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());

      if (!data.email || !data.password) {
        alert('Please fill in both email and password.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
        submitBtn.innerHTML = `
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Signing in...</span>
        `;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_name: data.email,
            user_email: data.email,
            password: data.password
          })
        });

        const res = await response.json();
        console.log('Login response:', res);

        if (response.ok && res && res.data) {
          const authSession = {
            uid: res.data.uid,
            name: res.data.name || (res.data.email ? res.data.email.split('@')[0] : 'User'),
            email: res.data.email || data.email,
            photoURL: res.data.picture || ''
          };
          localStorage.setItem('auth', JSON.stringify(authSession));
          console.log('Login successful, redirecting to Home...');
          window.location.href = '../Home/home.html';
        } else {
          alert(res.message || 'Login failed. Please check your credentials.');
        }
      } catch (err) {
        console.error('Error during login:', err);
        alert('Unable to connect to the server. Please ensure the backend is running.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  const registerForm = document.getElementById('form-register');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-register-submit');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

      const formData = new FormData(registerForm);
      const data = Object.fromEntries(formData.entries());

      if (data.password !== data.confirm_password) {
        alert('Passwords do not match. Please verify your password.');
        return;
      }

      if (!data.name || !data.email || !data.password) {
        alert('Please fill in all required fields.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
        submitBtn.innerHTML = `
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Creating account...</span>
        `;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: data.name,
            user_name: data.name,
            email: data.email,
            user_email: data.email,
            password: data.password
          })
        });

        const res = await response.json();
        console.log('Register response:', res);

        if (response.ok && res && res.data) {
          const authSession = {
            uid: res.data.uid,
            name: res.data.name || data.name,
            email: res.data.email || data.email,
            photoURL: res.data.picture || ''
          };
          localStorage.setItem('auth', JSON.stringify(authSession));
          console.log('Registration successful, redirecting to Home...');
          window.location.href = '../Home/home.html';
        } else {
          alert(res.message || 'Registration failed. Please try again.');
        }
      } catch (err) {
        console.error('Error during registration:', err);
        alert('Unable to connect to the server. Please ensure the backend is running.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }
}
