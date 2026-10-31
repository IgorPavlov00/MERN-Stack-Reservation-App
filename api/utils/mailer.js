// Sends transactional email through Brevo's HTTP API.
// (Render's free plan blocks outbound SMTP ports, so an HTTP API is used instead.)
// If BREVO_API_KEY / MAIL_FROM are not set, emails are logged and skipped.

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export const mailEnabled = () => Boolean(process.env.BREVO_API_KEY && process.env.MAIL_FROM);

export const sendEmail = async ({ to, toName, subject, html }) => {
  if (!mailEnabled()) {
    console.log(`[mail] skipped (not configured): "${subject}" -> ${to}`);
    return false;
  }
  try {
    const res = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: process.env.MAIL_FROM, name: process.env.MAIL_FROM_NAME || "Staybook" },
        to: [{ email: to, name: toName }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      console.error(`[mail] Brevo error ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mail] send failed:", err.message);
    return false;
  }
};
