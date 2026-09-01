import SignUpForm from '@/components/SignUpForm'
import { HERO_IMAGE } from '@/lib/initialData'

export const metadata = {
  title: 'Sign Up — Pehchaan Travels',
}

export default function SignUpPage() {
  return (
    <section className="auth-split" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
      <div className="auth-split__image" />
      <div className="auth-split__card">
        <SignUpForm />
      </div>
    </section>
  )
}
