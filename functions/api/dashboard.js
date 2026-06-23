import { getUserFromRequest, handleOptions, jsonResponse } from '../lib/auth.js';

export async function onRequestGet(context) {
  const { env } = context;
  const user = await getUserFromRequest(context.request, env);

  if (!user) {
    return jsonResponse({ error: 'Not authenticated' }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ error: 'Database not configured' }, 500);
  }

  try {
    const stats = await env.DB.prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
         COALESCE(SUM(payout_amount), 0) AS total_value
       FROM submissions
       WHERE user_id = ?`
    ).bind(user.id).first();

    const submissions = await env.DB.prepare(
      `SELECT order_code, card_brand, card_balance, payout_amount, payout_method, status, created_at
       FROM submissions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`
    ).bind(user.id).all();

    return jsonResponse({
      user,
      stats: {
        total: stats?.total || 0,
        pending: stats?.pending || 0,
        approved: stats?.approved || 0,
        totalValue: stats?.total_value || 0,
      },
      submissions: submissions.results || [],
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function onRequestOptions() {
  return handleOptions();
}