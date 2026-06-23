/* Swapio — Auth client */

let currentUser = null;
let authChecked = false;

async function fetchCurrentUser() {
  try {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    if (!response.ok) {
      currentUser = null;
      return null;
    }
    const data = await response.json();
    currentUser = data.authenticated ? data.user : null;
    return currentUser;
  } catch {
    currentUser = null;
    return null;
  }
}

function getCurrentUser() {
  return currentUser;
}

function isAuthenticated() {
  return !!currentUser;
}

function updateAuthNav() {
  const btn = document.getElementById('auth-nav-btn');
  const mobileBtn = document.getElementById('auth-nav-btn-mobile');
  const label = currentUser ? 'Dashboard' : 'Log In';
  const href = currentUser ? '/dashboard.html' : '/login.html';
  const className = currentUser ? 'nav-btn nav-btn-accent nav-btn-dashboard' : 'nav-btn nav-btn-accent';

  [btn, mobileBtn].forEach((el) => {
    if (!el) return;
    el.textContent = label;
    el.href = href;
    el.className = `${className}${el.id.includes('mobile') ? ' w-full text-center' : ''}`;
  });
}

async function initAuth() {
  await fetchCurrentUser();
  authChecked = true;
  updateAuthNav();
  document.dispatchEvent(new CustomEvent('swapio:auth-ready', { detail: { user: currentUser } }));
  return currentUser;
}

async function loginUser(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  currentUser = data.user;
  updateAuthNav();
  return data.user;
}

async function signupUser(username, email, password) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Sign up failed');
  }

  currentUser = data.user;
  updateAuthNav();
  return data.user;
}

async function logoutUser() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {});

  currentUser = null;
  updateAuthNav();
}

function waitForAuth() {
  if (authChecked) return Promise.resolve(currentUser);
  return new Promise((resolve) => {
    document.addEventListener('swapio:auth-ready', () => resolve(currentUser), { once: true });
  });
}