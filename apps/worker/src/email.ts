import {
  type EmailLocale,
  emailCopy,
  interpolate,
  isRtlEmailLocale,
  pickEmailLocale,
} from "./email-templates";
import type { FlareMoEnv } from "./env";

/**
 * Pluggable transactional email for registration verification.
 *
 * - `none` (default): self-hosted zero-config; registration does not require
 *   email verification.
 * - `cloudflare`: Cloudflare Email Sending (Workers Paid plan) via the
 *   `EMAIL` binding (`env.EMAIL.send({to, from, subject, html, text})`).
 *   The sender address must be a verified domain in the account.
 *
 * The seam mirrors the embedding/captcha provider pattern: the kernel never
 * hardcodes a vendor, and a deployment that does not configure a provider
 * keeps the exact self-hosted behavior.
 */

export type EmailProvider = "none" | "cloudflare";

export type EmailConfig = {
  provider: EmailProvider;
  /** Verified sender address, e.g. "no-reply@flaremo.app". */
  from: string | null;
};

export function resolveEmailConfig(env: FlareMoEnv): EmailConfig {
  const provider = (env.FLAREMO_EMAIL_PROVIDER?.trim() ||
    "none") as EmailProvider;
  if (provider === "cloudflare") {
    return {
      provider,
      from: env.FLAREMO_EMAIL_FROM?.trim() || null,
    };
  }
  return { provider: "none", from: null };
}

export type SendVerificationEmailInput = {
  to: string;
  /** Single-use verification token (already minted). */
  token: string;
  /** Public origin of the deployment, e.g. https://app.flaremo.app. */
  publicUrl: string;
  /**
   * Raw Accept-Language header of the request that triggered the send.
   * Every send path is self-service, so the requester is the recipient.
   */
  acceptLanguage?: string | null;
};

type DeliverEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Deliver a transactional email through the configured provider. Returns
 * false when no provider is configured or the send fails; the caller decides
 * whether that blocks the flow.
 */
async function deliverEmail(
  env: FlareMoEnv,
  input: DeliverEmailInput,
): Promise<boolean> {
  const config = resolveEmailConfig(env);
  if (config.provider === "none" || !config.from) return false;

  try {
    const binding = (
      env as FlareMoEnv & {
        EMAIL?: { send: (msg: unknown) => Promise<unknown> };
      }
    ).EMAIL;
    if (!binding) return false;
    await binding.send({
      to: input.to,
      from: config.from,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return true;
  } catch {
    return false;
  }
}

function actionButtonHtml(url: string, label: string) {
  return `<p><a href="${url}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px">${label}</a></p>`;
}

function footerHtml(
  copy: ReturnType<typeof emailCopy>,
  url: string,
  expiryHours: number,
  ignoreNote: string,
) {
  return [
    `<p style="color:#888;font-size:12px">${interpolate(copy.pasteLink, { url })}</p>`,
    `<p style="color:#888;font-size:12px">${interpolate(copy.expiresHours, { hours: expiryHours })} ${ignoreNote}</p>`,
  ].join("");
}

function emailHtml(
  locale: EmailLocale,
  heading: string,
  body: string,
  actionHtml: string,
  footer: string,
) {
  const rtl = isRtlEmailLocale(locale)
    ? ' dir="rtl" style="text-align:right"'
    : "";
  return `<div${rtl} style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px"><h2 style="margin:0 0 12px">${heading}</h2><p style="color:#444;line-height:1.6">${body}</p>${actionHtml}${footer}</div>`;
}

/**
 * Send the registration verification email.
 */
export async function sendVerificationEmail(
  env: FlareMoEnv,
  input: SendVerificationEmailInput,
): Promise<boolean> {
  const copy = emailCopy(pickEmailLocale(input.acceptLanguage));
  const verifyUrl = `${input.publicUrl.replace(/\/+$/, "")}/verify-email?token=${encodeURIComponent(input.token)}`;
  return deliverEmail(env, {
    to: input.to,
    subject: copy.verifyEmail.subject,
    html: [
      emailHtml(
        pickEmailLocale(input.acceptLanguage),
        copy.verifyEmail.heading,
        copy.verifyEmail.body,
        actionButtonHtml(verifyUrl, copy.verifyEmail.button),
        footerHtml(copy, verifyUrl, 24, copy.verifyEmail.ignore),
      ),
    ].join(""),
    text: `${copy.verifyEmail.body}\n\n${verifyUrl}\n\n${interpolate(copy.expiresHours, { hours: 24 })} ${copy.verifyEmail.ignore}`,
  });
}

/**
 * Send the self-service password reset email. The link opens the existing
 * /reset page, which submits the token to Better Auth's reset-password
 * endpoint; the recipient always sets their own new password.
 */
export async function sendPasswordResetEmail(
  env: FlareMoEnv,
  input: SendVerificationEmailInput,
): Promise<boolean> {
  const locale = pickEmailLocale(input.acceptLanguage);
  const copy = emailCopy(locale);
  const resetUrl = `${input.publicUrl.replace(/\/+$/, "")}/reset?token=${encodeURIComponent(input.token)}`;
  return deliverEmail(env, {
    to: input.to,
    subject: copy.resetPassword.subject,
    html: [
      emailHtml(
        locale,
        copy.resetPassword.heading,
        copy.resetPassword.body,
        actionButtonHtml(resetUrl, copy.resetPassword.button),
        footerHtml(copy, resetUrl, 1, copy.resetPassword.ignore),
      ),
    ].join(""),
    text: `${copy.resetPassword.body}\n\n${resetUrl}\n\n${interpolate(copy.expiresHours, { hours: 1 })} ${copy.resetPassword.ignore}`,
  });
}

/**
 * Send the "verify your new email address" mail for an email change. The
 * change only takes effect after the recipient confirms ownership of the new
 * address through this link.
 */
export async function sendEmailChangeVerificationEmail(
  env: FlareMoEnv,
  input: SendVerificationEmailInput,
): Promise<boolean> {
  const locale = pickEmailLocale(input.acceptLanguage);
  const copy = emailCopy(locale);
  const verifyUrl = `${input.publicUrl.replace(/\/+$/, "")}/verify-email-change?token=${encodeURIComponent(input.token)}`;
  return deliverEmail(env, {
    to: input.to,
    subject: copy.changeEmail.subject,
    html: [
      emailHtml(
        locale,
        copy.changeEmail.heading,
        copy.changeEmail.body,
        actionButtonHtml(verifyUrl, copy.changeEmail.button),
        footerHtml(copy, verifyUrl, 24, copy.changeEmail.ignore),
      ),
    ].join(""),
    text: `${copy.changeEmail.body}\n\n${verifyUrl}\n\n${interpolate(copy.expiresHours, { hours: 24 })} ${copy.changeEmail.ignore}`,
  });
}
