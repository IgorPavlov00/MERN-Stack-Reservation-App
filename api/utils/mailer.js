// Sends transactional email over an HTTP API (Render's free plan blocks SMTP ports).
// Supported providers, picked by which key is set:
//   RESEND_API_KEY  -> Resend   (https://resend.com)
//   BREVO_API_KEY   -> Brevo    (https://www.brevo.com)
// MAIL_FROM is the sender address. With Resend you can use "onboarding@resend.dev"
// for testing (only delivers to your own Resend account email) or an address on a
// domain you verified in Resend. If nothing is configured, emails are logged and skipped.

const providers = {
  resend: {
    enabled: () => Boolean(process.env.RESEND_API_KEY),
    send: ({ from, fromName, to, toName, subject, html }) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: `${fromName} <${from}>`,
          to: [toName ? `${toName} <${to}>` : to],
          subject,
          html,
        }),
      }),
  },
  brevo: {
    enabled: () => Boolean(process.env.BREVO_API_KEY),
    send: ({ from, fromName, to, toName, subject, html }) =>
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          sender: { email: from, name: fromName },
          to: [{ email: to, name: toName }],
          subject,
          htmlContent: html,
        }),
      }),
  },
};

const activeProvider = () => {
  const name = Object.keys(providers).find((p) => providers[p].enabled());
  return name ? [name, providers[name]] : [null, null];
};

const defaultFrom = (provider) =>
  process.env.MAIL_FROM || (provider === "resend" ? "onboarding@resend.dev" : "");

export const mailEnabled = () => {
  const [name] = activeProvider();
  return Boolean(name && defaultFrom(name));
};

export const sendEmail = async ({ to, toName, subject, html }) => {
  const [name, provider] = activeProvider();
  const from = name && defaultFrom(name);
  if (!provider || !from) {
    console.log(`[mail] skipped (not configured): "${subject}" -> ${to}`);
    return false;
  }
  try {
    const res = await provider.send({
      from,
      fromName: process.env.MAIL_FROM_NAME || "Staybook",
      to,
      toName,
      subject,
      html,
    });
    if (!res.ok) {
      console.error(`[mail] ${name} error ${res.status}: ${await res.text()}`);
      return false;
    }
    console.log(`[mail] sent via ${name}: "${subject}" -> ${to}`);
    return true;
  } catch (err) {
    console.error(`[mail] ${name} send failed:`, err.message);
    return false;
  }
};
