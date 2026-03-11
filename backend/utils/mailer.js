const nodemailer = require("nodemailer");

const hasSmtpConfig = () => {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
};

const createTransport = () => {
  if (!hasSmtpConfig()) return null;

  const port = Number(process.env.SMTP_PORT);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendMail = async ({ to, subject, text, html }) => {
  const transport = createTransport();
  if (!transport) return { sent: false, reason: "smtp_not_configured" };

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await transport.sendMail({ from, to, subject, text, html });
  return { sent: true };
};

module.exports = { sendMail, hasSmtpConfig };

