import 'dotenv/config'
import nodemailer from 'nodemailer'

async function main() {
  const host = (process.env.SMTP_HOST || '').trim()
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = (process.env.SMTP_USER || '').trim()
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '')
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  if (!host || !user || !pass) {
    console.error('SMTP NOT CONFIGURED:', { host: !!host, user: !!user, pass: !!pass })
    process.exit(1)
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })

  const info = await transporter.verify()
  console.log('SMTP verify() OK ->', info)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('SMTP verify() FAILED ->', err.message)
    process.exit(1)
  })
