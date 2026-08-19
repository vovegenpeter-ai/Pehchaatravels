import nodemailer from 'nodemailer'

interface SendPasswordResetEmailParams {
  to: string
  name: string
  resetUrl: string
}

function getMailTransporter() {
  const host = (process.env.SMTP_HOST || '').trim()
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = (process.env.SMTP_USER || '').trim()
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '')
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: SendPasswordResetEmailParams) {
  const transporter = getMailTransporter()

  if (!transporter) {
    console.warn(
      '[EMAIL WARNING] SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS to send emails. Reset link:',
      resetUrl
    )
    return {
      sent: false,
      reason: 'SMTP is not configured in environment variables.',
      resetUrl,
    }
  }

  const fromAddress =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    `"Pehchaan Travels" <${process.env.SMTP_USER}>`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f0e8; color: #2d3748;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #f5f0e8; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a4d3e; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">
                ✈ Pehchaan <span style="font-weight: 400; opacity: 0.9;">Travels</span>
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #1e3a5f; font-size: 20px; font-weight: 600;">
                Password Reset Request
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                Hello <strong>${name || 'Traveler'}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                We received a request to reset your Pehchaan Travels account password. Click the button below to choose a new password:
              </p>
              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #1a4d3e;">
                    <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px; background-color: #1a4d3e;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #718096;">
                This password reset link will expire in <strong>1 hour</strong>.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #718096;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a0aec0;">
                If the button above does not work, copy and paste this link into your browser:<br />
                <a href="${resetUrl}" style="color: #1a4d3e; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #edf2f7;">
              <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                © ${new Date().getFullYear()} Pehchaan Travels. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  const text = `
Hello ${name || 'Traveler'},

We received a request to reset your Pehchaan Travels account password.

Please visit the following link to reset your password:
${resetUrl}

This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this message.

— Pehchaan Travels Team
`

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: 'Reset Your Pehchaan Travels Password',
      text,
      html,
    })

    console.log('[EMAIL SUCCESS] Reset email sent to:', to, 'MessageId:', info.messageId)
    return { sent: true, messageId: info.messageId }
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send email via SMTP:', error)
    return {
      sent: false,
      reason: error instanceof Error ? error.message : 'Failed to send email',
      resetUrl,
    }
  }
}
