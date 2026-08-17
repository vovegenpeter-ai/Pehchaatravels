import SignUpForm from '@/components/SignUpForm'

export const metadata = {
  title: 'Sign Up — Pehchaan Travels',
}

export default function SignUpPage() {
  return (
    <section className="auth-section">
      <div className="container">
        <SignUpForm />
      </div>
    </section>
  )
}
