import 'dotenv/config'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MailComposer = require('nodemailer/lib/mail-composer')

const BS = String.fromCharCode(92)

async function main() {
  const from = process.env.SMTP_FROM || ''
  console.log('SMTP_FROM raw value :', from)
  console.log('contains backslash  :', from.includes(BS))

  const mail = {
    from,
    to: 'capture@example.com',
    subject: 'Booking Confirmed - TEST-HEADER',
    text: 'header check',
  }

  const raw: string = await new Promise((resolve, reject) => {
    new MailComposer(mail).compile().build((err: Error | null, msg: Buffer) =>
      err ? reject(err) : resolve(msg.toString())
    )
  })

  const headers = raw.split('\r\n\r\n')[0]
  const get = (name: string) =>
    headers.split('\r\n').filter((h) => h.toLowerCase().startsWith(name + ':'))

  console.log('From:    ->', get('from').join(' | '))
  console.log('Subject: ->', get('subject').join(' | '))
  console.log('To:      ->', get('to').join(' | '))
  const rendered = get('from').join('')
  console.log('From has backslash:', rendered.includes(BS))
  console.log(
    'From matches expected:',
    rendered === 'From: "Pehchaan Travels" <pehchaantravels@gmail.com>'
  )

  // What nodemailer's address parser makes of the raw SMTP_FROM value
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const addressparser = require('nodemailer/lib/addressparser')
  const parsed = addressparser(from)
  console.log('addressparser(from):', JSON.stringify(parsed))
  const names = parsed.map((a: { name?: string }) => a.name)
  console.log('display name clean :', names[0] === 'Pehchaan Travels')
}

main().catch((e) => {
  console.error('ERR:', e.message)
  process.exit(1)
})
