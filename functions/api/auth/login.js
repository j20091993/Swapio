import {
  EMAIL_REGEX,
  generateToken,
  handleOptions,
  jsonResponse,
  sessionCookie,
  sessionExpiry,
  verifyPassword,
} from '../../lib/auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    if (!env.DB) {
      return jsonResponse({ error: 'Database not configured' }, 500);
    }

    const data = await request.json();
    const email = String(data.email || '').trim().toLowerCase();
    const password = String(data.password || '');

    if (!EMAIL_REGEX.test(email)) {
      return jsonResponse({ error: 'Invalid email address' }, 400);
    }

    if (password.length < 6) {
      return jsonResponse({ error: 'Password must be at least 6 characters' }, 400);
    }

    const user = await env.DB.prepare(
      'SELECT id, username, email, password_hash, password_salt FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return jsonResponse({ error: 'Invalid email or password' }, 401);
    }

    const valid = await verifyPassword(password, user.password_hash, user.password_salt);
    if (!valid) {
      return jsonResponse({ error: 'Invalid email or password' }, 401);
    }

    const token = generateToken();
    const expiresAt = sessionExpiry();

    await env.DB.prepare(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)'
    ).bind(user.id, token, expiresAt).run();

    return jsonResponse(
      {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      200,
      { 'Set-Cookie': sessionCookie(token) }
    );
  } catch (err) {
    console.error('Login error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function onRequestOptions() {
  return handleOptions();
}