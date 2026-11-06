// Sharing helpers. wa.me is WhatsApp's official "click to chat" link: it opens WhatsApp
// (app or web) with the message pre-filled, and the user picks who to send it to.

/** "K7QM2XPA" → "K7QM-2XPA" (easier to read out loud). The server ignores the dash. */
export const prettyCode = (code) => `${code.slice(0, 4)}-${code.slice(4)}`;

export function whatsappInviteUrl({ code, examName }) {
  const appUrl = window.location.origin; // localhost while developing, the real site once deployed
  const goal = examName ? ` for ${examName}` : '';
  const text = [
    `Hi! I'm using Study Buddy to stay on track${goal}. Will you be my supporter? 🙏`,
    '',
    `1. Open ${appUrl}/signup and sign up as a *Supporter*`,
    `2. Enter my invite code: *${prettyCode(code)}*`,
    '',
    'The code works once, for 24 hours.',
  ].join('\n');
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
