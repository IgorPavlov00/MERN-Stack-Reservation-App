import { sendEmail } from "./mailer.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const appUrl = () => (process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:3000").replace(/\/$/, "");

const layout = (title, intro, booking, accent) => `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f6f8fb;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e3e7ee">
    <div style="background:#0a3d8f;color:#fff;padding:20px 24px;font-size:20px;font-weight:bold">Staybook</div>
    <div style="padding:24px;color:#1a2233">
      <h2 style="margin:0 0 8px;color:${accent}">${esc(title)}</h2>
      <p style="margin:0 0 20px;color:#5b6577">${intro}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 0;color:#5b6577">Property</td><td style="padding:6px 0;text-align:right"><b>${esc(booking.hotelName)}</b>, ${esc(booking.hotelCity)}</td></tr>
        <tr><td style="padding:6px 0;color:#5b6577">Check-in</td><td style="padding:6px 0;text-align:right">${fmt(booking.checkIn)}</td></tr>
        <tr><td style="padding:6px 0;color:#5b6577">Check-out</td><td style="padding:6px 0;text-align:right">${fmt(booking.checkOut)}</td></tr>
        <tr><td style="padding:6px 0;color:#5b6577">Nights</td><td style="padding:6px 0;text-align:right">${booking.nights}</td></tr>
        <tr><td style="padding:6px 0;color:#5b6577">Rooms</td><td style="padding:6px 0;text-align:right">${booking.rooms
          .map((r) => `${esc(r.title)} #${r.number}`)
          .join("<br>")}</td></tr>
        <tr><td style="padding:12px 0 0;border-top:1px solid #e3e7ee"><b>Total</b></td><td style="padding:12px 0 0;border-top:1px solid #e3e7ee;text-align:right;font-size:18px"><b>$${booking.total}</b></td></tr>
      </table>
      <p style="margin:24px 0 0"><a href="${appUrl()}/account" style="background:#0a3d8f;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;display:inline-block">View my trips</a></p>
      <p style="margin:20px 0 0;font-size:12px;color:#8a93a3">Booking reference: ${booking._id}</p>
    </div>
  </div>
</div>`;

const send = (user, subject, html) => sendEmail({ to: user.email, toName: user.username, subject, html });

export const sendBookingConfirmed = (user, b) =>
  send(
    user,
    `Booking confirmed: ${b.hotelName}`,
    layout("Your reservation is confirmed", `Hi ${esc(user.username)}, thanks for booking with Staybook. Here are your details:`, b, "#0e8a3a")
  );

export const sendBookingUpdated = (user, b) =>
  send(
    user,
    `Booking updated: ${b.hotelName}`,
    layout("Your reservation was updated", `Hi ${esc(user.username)}, the dates of your stay have changed. Your updated booking:`, b, "#0a3d8f")
  );

export const sendBookingCancelled = (user, b) =>
  send(
    user,
    `Booking cancelled: ${b.hotelName}`,
    layout("Your reservation was cancelled", `Hi ${esc(user.username)}, this reservation has been cancelled. We hope to see you another time.`, b, "#c62828")
  );
