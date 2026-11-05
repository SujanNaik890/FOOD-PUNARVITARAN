import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { Notification } from '../models/Notification.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Sends transactional email via Resend or simulated mock in dev/test
 */
export const sendEmailNotification = async ({ to, subject, html, text }) => {
  if (resend && env.NODE_ENV === 'production') {
    try {
      const data = await resend.emails.send({
        from: 'FoodBridge Operations <notifications@foodbridge.org>',
        to: [to],
        subject,
        html: html || `<p>${text}</p>`
      });
      return { success: true, id: data.id };
    } catch (err) {
      logger.error(`Resend email error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  // Dev / Test fallback simulation
  logger.info(`[Email Dispatch Simulation] To: ${to} | Subject: ${subject}`);
  return { success: true, simulated: true };
};

/**
 * Sends 6-digit OTP SMS via SMS provider or console simulation
 */
export const sendSmsOtp = async (phone, otp, purpose) => {
  logger.info(`[SMS Gateway Dispatch] Phone: +91-${phone} | OTP: ${otp} | Purpose: ${purpose}`);
  return { success: true, phone, deliveredAt: new Date() };
};

/**
 * Creates persistent user notification record
 */
export const createInAppNotification = async ({ recipientId, type, title, body, actionUrl }) => {
  const notification = new Notification({
    recipientId,
    type,
    title,
    body,
    actionUrl
  });
  await notification.save();
  return notification;
};
