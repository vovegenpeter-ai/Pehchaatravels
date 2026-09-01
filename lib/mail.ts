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

interface SendBookingConfirmationParams {
  to: string
  name: string
  orderId: string
  tourNames: string[]
  totalAmount: number
  bookingDate: string
  phone: string
}

export async function sendBookingConfirmationEmail({
  to,
  name,
  orderId,
  tourNames,
  totalAmount,
  bookingDate,
  phone,
}: SendBookingConfirmationParams) {
  const transporter = getMailTransporter()

  if (!transporter) {
    console.warn(
      '[EMAIL WARNING] SMTP is not configured. Booking confirmation email not sent for order:',
      orderId
    )
    return { sent: false, reason: 'SMTP is not configured in environment variables.' }
  }

  const fromAddress =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    `"Pehchaan Travels" <${process.env.SMTP_USER}>`

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://pehchaantravels.vercel.app').replace(/\/$/, '')
  const logoUrl = `${baseUrl}/logo.png`

  // White version of the logo for dark email headers
  const whiteLogoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 80" width="280" height="80"><g fill="none"><polygon points="15,70 45,20 75,70" fill="white"/><polygon points="40,70 70,30 100,70" fill="white" opacity="0.85"/><path d="M85 28 L105 18 L95 30 L110 35 L85 28Z" fill="white" opacity="0.9"/><path d="M110 35 L130 25 L120 40 L135 42 L110 35Z" fill="white" opacity="0.7"/><text x="115" y="38" fill="white" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="0.5">PEHCHAAN</text><text x="115" y="62" fill="white" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="0.5">TRAVELS</text></g></svg>'
  const emailLogoDataUri = `data:image/svg+xml;base64,${Buffer.from(whiteLogoSvg).toString('base64')}`

  const tourListHtml = tourNames.map((t) => `<li style="padding: 4px 0; color: #4a5568;">${t}</li>`).join('')
  const tourListText = tourNames.map((t) => `  • ${t}`).join('\n')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f0e8; color: #2d3748;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #f5f0e8; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a4d3e; padding: 28px 32px; text-align: center;">
              <img src="${emailLogoDataUri}" alt="Pehchaan Travels" style="height: 60px; width: auto; display: block; margin: 0 auto;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #e6fffa; color: #1a4d3e; font-size: 40px; width: 64px; height: 64px; line-height: 64px; border-radius: 50%;">✓</div>
              </div>
              <h2 style="margin: 0 0 16px 0; color: #1e3a5f; font-size: 20px; font-weight: 600; text-align: center;">
                Booking Confirmed!
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                Hello <strong>${name || 'Traveler'}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                Thank you for booking with Pehchaan Travels! Your tour booking has been received and is being processed. Here are your booking details:
              </p>
              <!-- Booking Details -->
              <table role="presentation" width="100%" style="background-color: #f7fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #718096; width: 140px;">Order ID</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #1e3a5f; font-weight: 600;">${orderId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #718096;">Customer</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #2d3748;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #718096;">Phone</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #2d3748;">${phone}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #718096;">Booking Date</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #2d3748;">${bookingDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #718096; vertical-align: top;">Tours</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #2d3748;">
                          <ul style="margin: 0; padding-left: 16px; list-style: none;">${tourListHtml}</ul>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 8px 0;"><hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;" /></td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 16px; color: #1e3a5f; font-weight: 700;">Total Amount</td>
                        <td style="padding: 6px 0; font-size: 16px; color: #1a4d3e; font-weight: 700;">PKR ${totalAmount.toLocaleString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                Our team will contact you within <strong>24 hours</strong> to confirm the details and finalize your trip arrangements.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #718096;">
                If you have any questions, please reply to this email or call us at the number provided on our website.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a0aec0;">
                Please save this email as your booking confirmation. Your Order ID is: <strong>${orderId}</strong>
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

Thank you for booking with Pehchaan Travels! Your booking has been received.

Booking Details:
─────────────────
Order ID:     ${orderId}
Customer:     ${name}
Phone:        ${phone}
Booking Date: ${bookingDate}
Tours:
${tourListText}
─────────────────
Total Amount: PKR ${totalAmount.toLocaleString()}

Our team will contact you within 24 hours to confirm the details.

Please save this email as your booking confirmation.

— Pehchaan Travels Team
`

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `Booking Confirmed — Reference #${orderId} | Pehchaan Travels`,
      text,
      html,
    })

    console.log('[EMAIL SUCCESS] Booking confirmation sent to:', to, 'MessageId:', info.messageId)
    return { sent: true, messageId: info.messageId }
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send booking confirmation:', error)
    return {
      sent: false,
      reason: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
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

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://pehchaantravels.vercel.app').replace(/\/$/, '')
  const logoUrl = `${baseUrl}/logo.png`

  // White version of the logo for dark email headers
  const whiteLogoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 80" width="280" height="80"><g fill="none"><polygon points="15,70 45,20 75,70" fill="white"/><polygon points="40,70 70,30 100,70" fill="white" opacity="0.85"/><path d="M85 28 L105 18 L95 30 L110 35 L85 28Z" fill="white" opacity="0.9"/><path d="M110 35 L130 25 L120 40 L135 42 L110 35Z" fill="white" opacity="0.7"/><text x="115" y="38" fill="white" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="0.5">PEHCHAAN</text><text x="115" y="62" fill="white" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="0.5">TRAVELS</text></g></svg>'
  const emailLogoDataUri = `data:image/svg+xml;base64,${Buffer.from(whiteLogoSvg).toString('base64')}`

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
              <img src="${emailLogoDataUri}" alt="Pehchaan Travels" style="height: 60px; width: auto; display: block; margin: 0 auto;" />
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

interface SendWelcomeEmailParams {
  to: string
  name: string
}

export async function sendWelcomeEmail({ to, name }: SendWelcomeEmailParams) {
  const transporter = getMailTransporter()

  if (!transporter) {
    console.warn('[EMAIL WARNING] SMTP is not configured. Welcome email not sent for:', to)
    return { sent: false, reason: 'SMTP is not configured in environment variables.' }
  }

  const fromAddress =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    `"Pehchaan Travels" <${process.env.SMTP_USER}>`

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://pehchaantravels.vercel.app').replace(/\/$/, '')
  const logoUrl = `${baseUrl}/logo.png`

  // White version of the logo for dark email headers
  const whiteLogoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 80" width="280" height="80"><g fill="none"><polygon points="15,70 45,20 75,70" fill="white"/><polygon points="40,70 70,30 100,70" fill="white" opacity="0.85"/><path d="M85 28 L105 18 L95 30 L110 35 L85 28Z" fill="white" opacity="0.9"/><path d="M110 35 L130 25 L120 40 L135 42 L110 35Z" fill="white" opacity="0.7"/><text x="115" y="38" fill="white" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="0.5">PEHCHAAN</text><text x="115" y="62" fill="white" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="0.5">TRAVELS</text></g></svg>'
  const emailLogoDataUri = `data:image/svg+xml;base64,${Buffer.from(whiteLogoSvg).toString('base64')}`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Pehchaan Travels</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f0e8; color: #2d3748;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #f5f0e8; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a4d3e; padding: 28px 32px; text-align: center;">
              <img src="${emailLogoDataUri}" alt="Pehchaan Travels" style="height: 60px; width: auto; display: block; margin: 0 auto;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #e6fffa; color: #1a4d3e; font-size: 40px; width: 64px; height: 64px; line-height: 64px; border-radius: 50%;">👋</div>
              </div>
              <h2 style="margin: 0 0 16px 0; color: #1e3a5f; font-size: 22px; font-weight: 600; text-align: center;">
                Welcome to Pehchaan Travels!
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                Hello <strong>${name || 'Traveler'}</strong>,
              </p>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                Thank you for creating an account with Pehchaan Travels! We're thrilled to have you join our community of travelers exploring the beauty of Pakistan.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                Whether you're dreaming of the majestic peaks of Gilgit-Baltistan, the serene valleys of Kashmir, or the vibrant culture of Lahore — we're here to help you plan the perfect trip.
              </p>
              <!-- Features -->
              <table role="presentation" width="100%" style="background-color: #f7fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #1e3a5f; font-weight: 600;">Here's what you can do:</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #4a5568;">🏔️ <strong>Browse Tours</strong> — Explore our curated tour packages across Pakistan</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #4a5568;">📍 <strong>Discover Places</strong> — Find hidden gems and popular destinations</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #4a5568;">🏨 <strong>Book Hotels</strong> — Reserve accommodations at the best rates</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #4a5568;">✈️ <strong>Custom Trips</strong> — Request a personalized travel itinerary</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0; text-align: center; width: 100%;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #1a4d3e;">
                    <a href="${baseUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px; background-color: #1a4d3e;">
                      Start Exploring
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #718096;">
                If you have any questions or need assistance planning your trip, feel free to reach out to us. We're always happy to help!
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a0aec0;">
                Happy travels!<br />
                The Pehchaan Travels Team
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

Welcome to Pehchaan Travels!

Thank you for creating an account. We're thrilled to have you join our community of travelers exploring the beauty of Pakistan.

Here's what you can do:
  • Browse Tours — Explore our curated tour packages
  • Discover Places — Find hidden gems and popular destinations
  • Book Hotels — Reserve accommodations at the best rates
  • Custom Trips — Request a personalized travel itinerary

Start exploring: ${baseUrl}

If you have any questions, feel free to reach out to us. We're always happy to help!

Happy travels!
— Pehchaan Travels Team
`

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: 'Welcome to Pehchaan Travels! 🎉',
      text,
      html,
    })

    console.log('[EMAIL SUCCESS] Welcome email sent to:', to, 'MessageId:', info.messageId)
    return { sent: true, messageId: info.messageId }
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send welcome email:', error)
    return {
      sent: false,
      reason: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}

interface SendNewsletterEmailParams {
  to: string
  subject: string
  title: string
  content: string
  image?: string
  ctaText?: string
  ctaUrl?: string
  unsubscribeEmail: string
}

export async function sendNewsletterEmail({
  to,
  subject,
  title,
  content,
  image,
  ctaText,
  ctaUrl,
  unsubscribeEmail,
}: SendNewsletterEmailParams) {
  const transporter = getMailTransporter()

  if (!transporter) {
    console.warn('[EMAIL WARNING] SMTP is not configured. Newsletter email not sent to:', to)
    return { sent: false, reason: 'SMTP is not configured in environment variables.' }
  }

  const fromAddress =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    `"Pehchaan Travels" <${process.env.SMTP_USER}>`

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://pehchaantravels.vercel.app').replace(/\/$/, '')
  const logoUrl = `${baseUrl}/logo.png`
  const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(unsubscribeEmail)}`

  // White version of the logo for dark email headers
  const whiteLogoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 80" width="280" height="80"><g fill="none"><polygon points="15,70 45,20 75,70" fill="white"/><polygon points="40,70 70,30 100,70" fill="white" opacity="0.85"/><path d="M85 28 L105 18 L95 30 L110 35 L85 28Z" fill="white" opacity="0.9"/><path d="M110 35 L130 25 L120 40 L135 42 L110 35Z" fill="white" opacity="0.7"/><text x="115" y="38" fill="white" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="0.5">PEHCHAAN</text><text x="115" y="62" fill="white" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="0.5">TRAVELS</text></g></svg>'
  const emailLogoDataUri = `data:image/svg+xml;base64,${Buffer.from(whiteLogoSvg).toString('base64')}`

  const imageHtml = image ? `<img src="${image}" alt="" style="width: 100%; max-width: 560px; height: auto; border-radius: 8px; margin-bottom: 24px;" />` : ''

  const ctaHtml = ctaText && ctaUrl ? `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td align="center" style="border-radius: 8px; background-color: #1a4d3e;">
          <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px; background-color: #1a4d3e;">
            ${ctaText}
          </a>
        </td>
      </tr>
    </table>
  ` : ''

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f0e8; color: #2d3748;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #f5f0e8; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a4d3e; padding: 28px 32px; text-align: center;">
              <img src="${emailLogoDataUri}" alt="Pehchaan Travels" style="height: 60px; width: auto; display: block; margin: 0 auto;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #1e3a5f; font-size: 20px; font-weight: 600;">
                ${title}
              </h2>
              ${imageHtml}
              <div style="font-size: 15px; line-height: 1.7; color: #4a5568;">
                ${content}
              </div>
              ${ctaHtml}
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a0aec0;">
                You are receiving this email because you subscribed to our newsletter.
                <a href="${unsubscribeUrl}" style="color: #1a4d3e;">Unsubscribe</a>
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
${title}

${content.replace(/<[^>]*>/g, '')}

${ctaText && ctaUrl ? `\n${ctaText}: ${ctaUrl}` : ''}

---
You are receiving this email because you subscribed to our newsletter.
Unsubscribe: ${unsubscribeUrl}

© ${new Date().getFullYear()} Pehchaan Travels. All rights reserved.
`

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    })

    console.log('[EMAIL SUCCESS] Newsletter sent to:', to, 'MessageId:', info.messageId)
    return { sent: true, messageId: info.messageId }
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send newsletter:', error)
    return {
      sent: false,
      reason: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}
