// Mobile Messaging Service for Telegram, WhatsApp, and Webhooks

export interface MessagePayload {
  title: string;
  body: string;
  slot: 'morning' | 'afternoon' | 'evening' | 'test';
  day?: number;
  streak?: number;
  srsDueCount?: number;
  todaySolved?: number;
  target?: number;
  problems?: { title: string; number?: number; difficulty: string; url: string }[];
}

export function formatTelegramMessage(payload: MessagePayload): string {
  const { title, body, slot, day, streak, srsDueCount, problems } = payload;
  const timeIcon = slot === 'morning' ? '🌅' : slot === 'afternoon' ? '☀️' : slot === 'evening' ? '🌙' : '🔔';

  let msg = `<b>${timeIcon} ${title}</b>\n\n`;
  msg += `${body}\n\n`;

  if (streak !== undefined && streak > 0) {
    msg += `🔥 <b>Active Streak:</b> ${streak} day${streak !== 1 ? 's' : ''}\n`;
  }

  if (srsDueCount !== undefined && srsDueCount > 0) {
    msg += `🧠 <b>Spaced Repetition Due:</b> ${srsDueCount} questions\n`;
  }

  if (problems && problems.length > 0) {
    msg += `\n📚 <b>Today's Questions:</b>\n`;
    problems.forEach(p => {
      const numStr = p.number ? `#${p.number} ` : '';
      msg += `• <a href="${p.url}">${numStr}${p.title}</a> [${p.difficulty}]\n`;
    });
  }

  msg += `\n🚀 <i>Stay consistent with DSA 30!</i>`;
  return msg;
}

export function formatWhatsAppMessage(payload: MessagePayload): string {
  const { title, body, slot, streak, srsDueCount, problems } = payload;
  const timeIcon = slot === 'morning' ? '🌅' : slot === 'afternoon' ? '☀️' : slot === 'evening' ? '🌙' : '🔔';

  let msg = `${timeIcon} *${title}*\n\n`;
  msg += `${body}\n\n`;

  if (streak !== undefined && streak > 0) {
    msg += `🔥 *Active Streak:* ${streak} days\n`;
  }
  if (srsDueCount !== undefined && srsDueCount > 0) {
    msg += `🧠 *SRS Due:* ${srsDueCount} questions\n`;
  }
  if (problems && problems.length > 0) {
    msg += `\n📚 *Today's Questions:*\n`;
    problems.forEach(p => {
      const numStr = p.number ? `#${p.number} ` : '';
      msg += `• ${numStr}${p.title} (${p.difficulty})\n  ${p.url}\n`;
    });
  }

  msg += `\n🚀 Keep your momentum in DSA 30!`;
  return msg;
}

/**
 * Sends a message via Telegram Bot API directly to the user's phone
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  payload: MessagePayload
): Promise<{ success: boolean; error?: string }> {
  const token = botToken.trim();
  const chat = chatId.trim();

  if (!token || !chat) {
    return { success: false, error: 'Telegram Bot Token and Chat ID are required.' };
  }

  const text = formatTelegramMessage(payload);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { success: false, error: data.description || 'Telegram API rejected message.' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error connecting to Telegram.' };
  }
}

/**
 * Sends a WhatsApp message via CallMeBot free API
 */
export async function sendWhatsAppMessage(
  phone: string,
  apiKey: string,
  payload: MessagePayload
): Promise<{ success: boolean; error?: string }> {
  const cleanPhone = phone.trim().replace(/[^\d+]/g, '');
  const key = apiKey.trim();

  if (!cleanPhone || !key) {
    return { success: false, error: 'WhatsApp phone number (with country code) and API key are required.' };
  }

  const text = formatWhatsAppMessage(payload);
  const encodedText = encodeURIComponent(text);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${key}`;

  try {
    // CallMeBot supports direct GET requests
    const res = await fetch(url, { method: 'GET', mode: 'no-cors' });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to send WhatsApp message.' };
  }
}

/**
 * Sends a webhook message (e.g. Discord, Make.com, Zapier, Webhook.site)
 */
export async function sendCustomWebhook(
  webhookUrl: string,
  payload: MessagePayload
): Promise<{ success: boolean; error?: string }> {
  const target = webhookUrl.trim();
  if (!target) {
    return { success: false, error: 'Webhook URL is required.' };
  }

  const text = formatWhatsAppMessage(payload);

  try {
    const res = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: text,
        text,
        title: payload.title,
        day: payload.day,
        streak: payload.streak,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      return { success: false, error: `Webhook responded with status ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to dispatch webhook.' };
  }
}
