// frontend/Auth/auth.js
// Handles client-side UI interactions for Auth forms (Login & Register).
// Backend API hooks can be wired into the stub functions below.

document.addEventListener('DOMContentLoaded', () => {
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

/**
 * Google Auth interaction stub (ready for OAuth/Firebase/Backend integration)
 */
function initGoogleAuth() {
  const googleBtn = document.getElementById('btn-google-auth');
  if (!googleBtn) return;

  googleBtn.addEventListener('click', () => {
    console.log('Google Auth clicked — ready for OAuth provider integration.');
    // Example: window.location.href = '/api/auth/google';
  });
}

/**
 * Form submit stubs
 */
function initFormPlaceholders() {
  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());
      console.log('Login submitted:', { email: data.email, remember: !!data.remember });
      // TODO: Connect with authentication API
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
      // TODO: Connect with registration API
    });
  }
}
