import SignInForm from '@/components/SignInForm'

export const metadata = {
  title: 'Sign In — Pehchaan Travels',
}

export default function SignInPage() {
  return (
    <section className="auth-section">
      <div className="container">
        <SignInForm />
      </div>
    </section>
  )
}
