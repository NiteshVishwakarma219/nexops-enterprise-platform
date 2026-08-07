/**
 * Sends transactional email. Tries Resend's HTTP API first (since it needs
 * no SMTP setup), falling back to Gmail SMTP via nodemailer if only
 * EMAIL_USER/EMAIL_PASS are configured. In local dev with neither
 * configured, it just logs the email instead of throwing.
 */
const nodemailer = require('nodemailer');

async function sendViaResend({ to, subject, html }) {
  const fromAddress = process.env.EMAIL_USER
    ? `NexOps Enterprise <onboarding@resend.dev>` // Resend's shared sandbox sender
    : 'NexOps Enterprise <onboarding@resend.dev>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: fromAddress, to, subject, html }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Resend API error (${response.status}): ${errBody}`);
  }
}

let gmailTransporter = null;
async function sendViaGmail({ to, subject, html }) {
  if (!gmailTransporter) {
    gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  await gmailTransporter.sendMail({ from: `NexOps Enterprise <${process.env.EMAIL_USER}>`, to, subject, html });
}

async function sendEmail({ to, subject, html }) {
  if (process.env.RESEND_API_KEY) {
    return sendViaResend({ to, subject, html });
  }
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return sendViaGmail({ to, subject, html });
  }
  // No email provider configured — log instead of failing the request.
  console.log(`[DEV EMAIL - no provider configured]\nTo: ${to}\nSubject: ${subject}\n${html}\n`);
}

/** Fire-and-forget notification to the admin inbox (NOTIFY_EMAIL). Never throws. */
async function notifyAdmin(subject, html) {
  if (!process.env.NOTIFY_EMAIL) return;
  try {
    await sendEmail({ to: process.env.NOTIFY_EMAIL, subject, html });
  } catch (err) {
    console.error('Admin notification email failed:', err.message);
  }
}

module.exports = { sendEmail, notifyAdmin };
