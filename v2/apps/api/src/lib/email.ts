/**
 * Email sender — minimal interface with two implementations:
 *  - `LogEmailSender`: writes the would-be email to the logger. Used in
 *    development and tests so we never hit the network from the dev box.
 *  - `ResendEmailSender`: lazy-loads the resend SDK and posts to it.
 *    Used in production when RESEND_API_KEY is set.
 *
 * Switch is automatic based on env: real key → Resend; missing → log.
 */
import { getConfig } from './config.js';
import { logger } from './logger.js';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

class LogEmailSender implements EmailSender {
  send(message: EmailMessage): Promise<void> {
    logger.info(
      { to: message.to, subject: message.subject, kind: 'email' },
      `[email] (dev/no-key) would send to ${message.to}: ${message.subject}`,
    );
    logger.debug({ html: message.html, text: message.text }, '[email body]');
    return Promise.resolve();
  }
}

class ResendEmailSender implements EmailSender {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    // Lazy import so the dependency only loads when actually used.
    const { Resend } = await import('resend');
    const client = new Resend(this.apiKey);
    const result = await client.emails.send({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    if (result.error) {
      throw new Error(`Resend send failed: ${result.error.message}`);
    }
    logger.info({ to: message.to, id: result.data.id }, 'email sent via Resend');
  }
}

let cached: EmailSender | undefined;

export function getEmailSender(): EmailSender {
  if (cached) return cached;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'hola@elinstantedelhombregris.com';
  if (apiKey) {
    cached = new ResendEmailSender(apiKey, from);
  } else {
    if (getConfig().env === 'production') {
      logger.warn('RESEND_API_KEY is missing in production — emails will be logged, not sent');
    }
    cached = new LogEmailSender();
  }
  return cached;
}

/** Test-only: replace the cached sender. */
export function setEmailSender(sender: EmailSender): void {
  cached = sender;
}
