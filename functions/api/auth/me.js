import { getUserFromRequest, handleOptions, jsonResponse } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const user = await getUserFromRequest(context.request, context.env);
  if (!user) {
    return jsonResponse({ authenticated: false }, 401);
  }
  return jsonResponse({ authenticated: true, user });
}

export async function onRequestOptions() {
  return handleOptions();
}