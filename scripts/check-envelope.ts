import 'dotenv/config'
import nodemailer from 'nodemailer'

const BS = String.fromCharCode(92)

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    auth: {
      user: (process.env.SMTP_USER || '').trim(),
      pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
    },
  })

  console.log('SMTP_FROM ->', process.env.SMTP_FROM)
  console.log('has backslash:', (process.env.SMTP_FROM || '').includes(BS))

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: (process.env.SMTP_USER || '').trim(),
    subject: 'Pehchaan Travels - sender header test',
    text: 'Verifying the From: header renders correctly.',
  })

  console.log('messageId :', info.messageId)
  console.log('envelope  :', JSON.stringify(info.envelope, null, 2))
  const envFrom = String(
    Array.isArray(info.envelope?.from) ? info.envelope.from[0] : info.envelope?.from || ''
  )
  console.log('envelope from      :', envFrom)
  console.log('envelope from clean:', envFrom === 'pehchaantravels@gmail.com')
  console.log(
    'From header clean  :',
    (process.env.SMTP_FROM || '') === '"Pehchaan Travels" <pehchaantravels@gmail.com>'
  )
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAILED ->', e.message)
    process.exit(1)
  })
