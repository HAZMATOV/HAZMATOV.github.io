// Этот endpoint активен только на VPS с Node.js адаптером.
// На GitHub Pages не используется — форма направляет в Telegram напрямую.
export const prerender = true;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: false, error: 'not available on static hosting' }), { status: 503 });
};
