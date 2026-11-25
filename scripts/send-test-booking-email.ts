import 'dotenv/config'
import { sendBookingConfirmationEmail } from '../lib/mail'

async function main() {
  const to = (process.env.SMTP_USER || '').trim()

  if (!to) {
    console.error('SMTP_USER is not set in .env — no recipient.')
    process.exit(1)
  }

  console.log('Sending booking confirmation via lib/mail.ts ->', to)

  const result = await sendBookingConfirmationEmail({
    to,
    name: 'Test Customer',
    orderId: 'TEST-' + Date.now(),
    tourNames: ['Neelum Valley Excursion (test)'],
    totalAmount: 9999,
    bookingDate: new Date().toISOString().slice(0, 10),
    phone: '+92 300 0000000',
  })

  console.log('RESULT:', JSON.stringify(result, null, 2))
  process.exit(result.sent ? 0 : 1)
}

main().catch((err) => {
  console.error('THREW:', err.message)
  process.exit(1)
})
