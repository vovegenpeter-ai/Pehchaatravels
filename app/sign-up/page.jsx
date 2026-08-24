import SignUpForm from '@/components/SignUpForm'
import { HERO_IMAGE } from '@/lib/initialData'

export const metadata = {
  title: 'Sign Up — Pehchaan Travels',
}

export default function SignUpPage() {
  return (
    <section className="auth-hero" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
      <div className="auth-hero__overlay">
        <SignUpForm />
      </div>
    </section>
  )
}
