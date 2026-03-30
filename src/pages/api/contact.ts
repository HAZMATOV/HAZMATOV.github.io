export const prerender = false;

import type { APIRoute } from 'astro';

const BOT_TOKEN = import.meta.env.TG_BOT_TOKEN;
const CHAT_ID = import.meta.env.TG_CHAT_ID || '5794318325';

// Rate limit: 5 запросов с IP за 10 минут
const rateMap = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 10 * 60 * 1000;
  const hits = (rateMap.get(ip) || []).filter(t => now - t < window);
  hits.push(now);
  rateMap.set(ip, hits);
  return hits.length > 5;
}

async function sendToTelegram(text: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
  });
  return res.json();
}

export const POST: APIRoute = async ({ request }) => {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ ok: false, error: 'too many requests' }), { status: 429 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid json' }), { status: 400 });
  }

  const { name, contact, message, source } = body;

  if (!name?.trim() || !contact?.trim()) {
    return new Response(JSON.stringify({ ok: false, error: 'missing fields' }), { status: 400 });
  }

  const text = [
    `📩 <b>Новая заявка с сайта</b>`,
    `📌 Источник: ${source || 'Форма контактов'}`,
    `👤 Имя: ${name}`,
    `📞 Контакт: ${contact}`,
    message ? `💬 Сообщение: ${String(message).slice(0, 500)}` : null,
  ].filter(Boolean).join('\n');

  try {
    await sendToTelegram(text);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'telegram error' }), { status: 500 });
  }
};
