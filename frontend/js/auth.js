// Base API configuration (handles local Live Server vs local Backend vs file:/// vs Production deployment)
if (typeof window.getApiBase !== 'function') {
  window.getApiBase = () => {
    if (window.location.protocol === 'file:') {
      return 'http://localhost:5000';
    }
    if (window.location.port && window.location.port !== '5000') {
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    return '';
  };
}
var API_BASE = window.getApiBase();

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();  // Stop page from refreshing on submit

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('error-msg');

  try {
    // Send POST request to our backend
    const res = await fetch(`${API_BASE}/api/auth/login`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })  // Send as JSON
    });

    const data = await res.json();

    if (!res.ok) {
      // Show error if login failed
      errorMsg.textContent = data.message;
      errorMsg.style.display = 'block';
      return;
    }

    // Login successful!
    // Save token and user info in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));

    // Redirect based on role
    if (data.role === 'admin') {
      window.location.href = 'pages/admin.html';
    } else {
      window.location.href = 'pages/dashboard.html';
    }

  } catch (err) {
    errorMsg.textContent = 'Server error. Please try again.';
    errorMsg.style.display = 'block';
  }
});

// ── CONTINUE WITH GOOGLE FEATURE (DIRECT GMAIL SIGN-IN) ──
document.getElementById('btnGoogle')?.addEventListener('click', (e) => {
  e.preventDefault();
  showGoogleDirectModal(false); // false = relative to index.html (at root)
});

function showGoogleDirectModal(isInsidePagesDir) {
  // Inject modal into document body
  const modalHtml = `
    <div id="google-modal-overlay" style="
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.45); display: flex; align-items: center; justify-content: center;
      z-index: 10000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      opacity: 0; transition: opacity 0.25s ease-out;
    ">
      <div style="
        background: #ffffff; width: 400px; border-radius: 12px; padding: 36px 32px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.15); transform: scale(0.9);
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-sizing: border-box; display: flex; flex-direction: column; align-items: center;
      ">
        <div style="margin-bottom: 20px;">
          <svg width="36" height="36" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.77z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.39 24 12 24z"/>
            <path fill="#FBBC05" d="M5.32 14.24A7.16 7.16 0 0 1 5 12c0-.79.13-1.57.32-2.34V6.51H1.21A11.94 11.94 0 0 0 0 12c0 2.05.52 4 1.21 5.49l4.11-3.25z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.18 2.12 1.21 5.49l4.11 3.25c.94-2.85 3.57-4.99 6.68-4.99z"/>
          </svg>
        </div>
        
        <h3 style="font-size: 20px; font-weight: 700; color: #202124; margin: 0 0 8px 0; text-align: center;">Continue with Google</h3>
        <p style="font-size: 13px; color: #5f6368; text-align: center; margin: 0 0 24px 0; line-height: 1.5;">
          Enter your Gmail address to sign in or sign up instantly.
        </p>

        <form id="google-modal-form" style="width: 100%; display: flex; flex-direction: column; gap: 16px;">
          <div style="position: relative; width: 100%;">
            <input type="email" id="google-gmail-id" style="
              width: 100%; padding: 14px 16px; border: 1.5px solid #dadce0; border-radius: 8px; font-size: 14px;
              outline: none; box-sizing: border-box; transition: all 0.2s;
              font-family: inherit;
            " placeholder="name@gmail.com" required>
          </div>
          <p id="google-modal-error" style="color: #d93025; font-size: 12px; margin: -8px 0 0 0; display: none; text-align: left; width: 100%;"></p>
          
          <button type="submit" id="btn-google-modal-submit" style="
            width: 100%; background: #1a73e8; border: none; color: #ffffff; font-size: 14px; font-weight: 600;
            cursor: pointer; padding: 14px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.2s; font-family: inherit;
          %">
            Continue
          </button>
          
          <button type="button" id="btn-google-modal-cancel" style="
            width: 100%; background: none; border: none; color: #5f6368; font-size: 13px; font-weight: 500;
            cursor: pointer; padding: 8px; border-radius: 4px; transition: all 0.2s; font-family: inherit;
          %">
            Cancel
          </button>
        </form>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = modalHtml;
  const modalEl = div.firstElementChild;
  document.body.appendChild(modalEl);

  // Trigger animations
  requestAnimationFrame(() => {
    modalEl.style.opacity = '1';
    modalEl.children[0].style.transform = 'scale(1)';
  });

  const emailInput = modalEl.querySelector('#google-gmail-id');
  const submitBtn = modalEl.querySelector('#btn-google-modal-submit');
  const cancelBtn = modalEl.querySelector('#btn-google-modal-cancel');
  const errorEl = modalEl.querySelector('#google-modal-error');
  const formEl = modalEl.querySelector('#google-modal-form');

  emailInput.focus();

  // Focus interactions
  emailInput.addEventListener('focus', () => {
    emailInput.style.borderColor = '#1a73e8';
    emailInput.style.boxShadow = '0 0 0 3px rgba(26, 115, 232, 0.15)';
  });
  emailInput.addEventListener('blur', () => {
    emailInput.style.borderColor = '#dadce0';
    emailInput.style.boxShadow = 'none';
  });

  // Buttons hovers
  submitBtn.addEventListener('mouseover', () => {
    submitBtn.style.background = '#1557b0';
    submitBtn.style.boxShadow = '0 4px 8px rgba(26,115,232,0.3)';
  });
  submitBtn.addEventListener('mouseout', () => {
    submitBtn.style.background = '#1a73e8';
    submitBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });

  cancelBtn.addEventListener('mouseover', () => {
    cancelBtn.style.background = '#f8f9fa';
    cancelBtn.style.color = '#202124';
  });
  cancelBtn.addEventListener('mouseout', () => {
    cancelBtn.style.background = 'none';
    cancelBtn.style.color = '#5f6368';
  });

  function closeModal() {
    modalEl.style.opacity = '0';
    modalEl.children[0].style.transform = 'scale(0.9)';
    setTimeout(() => modalEl.remove(), 250);
  }

  cancelBtn.addEventListener('click', closeModal);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });

  // Helper function to capitalize and format name
  function getNameFromEmail(email) {
    const localPart = email.split('@')[0];
    const cleanPart = localPart.replace(/\d+/g, '');
    if (!cleanPart) return localPart;
    return cleanPart
      .split(/[\._-]/)
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    
    if (!email) {
      errorEl.textContent = 'Please enter your Gmail ID.';
      errorEl.style.display = 'block';
      return;
    }
    
    // Quick validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorEl.textContent = 'Please enter a valid email address.';
      errorEl.style.display = 'block';
      return;
    }

    const name = getNameFromEmail(email);

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';
      
      const host = API_BASE;
      const res = await fetch(`${host}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        closeModal();

        // Redirect relative to where we are
        if (data.role === 'admin') {
          window.location.href = isInsidePagesDir ? 'admin.html' : 'pages/admin.html';
        } else {
          window.location.href = isInsidePagesDir ? 'dashboard.html' : 'pages/dashboard.html';
        }
      } else {
        errorEl.textContent = data.message || 'Authentication failed.';
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Continue';
      }
    } catch (err) {
      console.error(err);
      errorEl.textContent = 'Server communication error. Make sure backend is running.';
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Continue';
    }
  });
}

