import {
  clearSessionCookie,
  getCookie,
  handleOptions,
  jsonResponse,
} from '../../lib/auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const token = getCookie(request, 'swapio_session');
    if (token && env.DB) {
      await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    }

    return jsonResponse(
      { success: true },
      200,
      { 'Set-Cookie': clearSessionCookie() }
    );
  } catch (err) {
    console.error('Logout error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function onRequestOptions() {
  return handleOptions();
}