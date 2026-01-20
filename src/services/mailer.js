import nodemailer from "nodemailer";
import { config } from "../config/env.js";
import { logger } from "../config/logger.js";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!config.smtp.host) {
    throw new Error("SMTP_HOST is not configured");
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: Number(config.smtp.port),
    secure: Number(config.smtp.port) === 465,
    auth:
      config.smtp.user && config.smtp.pass
        ? { user: config.smtp.user, pass: config.smtp.pass }
        : undefined
  });

  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  const info = await t.sendMail({
    from: config.emailFrom,
    to,
    subject,
    text,
    html
  });
  logger.info({ messageId: info.messageId, to }, "Email sent");
  return info;
}

export { sendMail };


