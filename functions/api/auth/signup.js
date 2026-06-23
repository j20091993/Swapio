import {
  EMAIL_REGEX,
  USERNAME_REGEX,
  generateToken,
  handleOptions,
  hashPassword,
  jsonResponse,
  sessionCookie,
  sessionExpiry,
} from '../../lib/auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    if (!env.DB) {
      return jsonResponse({ error: 'Database not configured' }, 500);
    }

    const data = await request.json();
    const username = String(data.username || '').trim();
    const email = String(data.email || '').trim().toLowerCase();
    const password = String(data.password || '');

    if (!USERNAME_REGEX.test(username)) {
      return jsonResponse({ error: 'Username must be 3–24 characters (letters, numbers, underscore)' }, 400);
    }

    if (!EMAIL_REGEX.test(email)) {
      return jsonResponse({ error: 'Invalid email address' }, 400);
    }

    if (password.length < 6) {
      return jsonResponse({ error: 'Password must be at least 6 characters' }, 400);
    }

    const existing = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ? COLLATE NOCASE'
    ).bind(email, username).first();

    if (existing) {
      return jsonResponse({ error: 'Email or username already in use' }, 409);
    }

    const { hash, salt } = await hashPassword(password);

    const result = await env.DB.prepare(
      'INSERT INTO users (username, email, password_hash, password_salt) VALUES (?, ?, ?, ?)'
    ).bind(username, email, hash, salt).run();

    const userId = result.meta.last_row_id;
    const token = generateToken();
    const expiresAt = sessionExpiry();

    await env.DB.prepare(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)'
    ).bind(userId, token, expiresAt).run();

    const user = { id: userId, username, email };

    return jsonResponse(
      { success: true, user },
      200,
      { 'Set-Cookie': sessionCookie(token) }
    );
  } catch (err) {
    console.error('Signup error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function onRequestOptions() {
  return handleOptions();
}