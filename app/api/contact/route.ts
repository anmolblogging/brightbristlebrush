import nodemailer from "nodemailer";
import { EMAIL } from "@/lib/site";

// Sends contact-form enquiries through Gmail / Google Workspace SMTP.
// Required env vars: SMTP_USER (the mailbox the app password belongs to) and
// SMTP_PASS (the 16-character app password). Optional: CONTACT_TO (defaults to EMAIL).

const LIMITS = { name: 120, company: 160, phone: 40, email: 200, message: 5000 } as const;
type Field = keyof typeof LIMITS;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  if (!user || !pass) {
    console.error("Contact form: SMTP_USER / SMTP_PASS are not set");
    return Response.json({ error: "Email is not configured on the server." }, { status: 500 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (typeof raw.website === "string" && raw.website.trim() !== "") {
    return Response.json({ ok: true });
  }

  const data = {} as Record<Field, string>;
  for (const key of Object.keys(LIMITS) as Field[]) {
    const value = typeof raw[key] === "string" ? (raw[key] as string).trim() : "";
    if (value.length > LIMITS[key]) {
      return Response.json({ error: `Please shorten the ${key} field.` }, { status: 400 });
    }
    data[key] = value;
  }
  if (!data.name || !data.message || !EMAIL_RE.test(data.email)) {
    return Response.json({ error: "Please fill in your name, a valid email and a message." }, { status: 400 });
  }

  const rows: [string, string][] = [
    ["Name", data.name],
    ["Company", data.company || "—"],
    ["Email", data.email],
    ["Phone", data.phone || "—"],
  ];
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${data.message}`;
  const html = `
    <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
      ${rows.map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#615a52"><b>${k}</b></td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`).join("")}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap;margin-top:16px">${escapeHtml(data.message)}</p>`;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: { name: "Website Enquiry", address: user },
      to: process.env.CONTACT_TO || EMAIL,
      replyTo: { name: data.name, address: data.email },
      subject: `New enquiry from ${data.name}${data.company ? ` (${data.company})` : ""}`,
      text,
      html,
    });
  } catch (err) {
    console.error("Contact form: sending failed", err);
    return Response.json({ error: "We couldn't send your message right now." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
