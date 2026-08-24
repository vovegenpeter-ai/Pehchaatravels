import SignInForm from '@/components/SignInForm'
import { HERO_IMAGE } from '@/lib/initialData'

export const metadata = {
  title: 'Sign In — Pehchaan Travels',
}

export default function SignInPage() {
  return (
    <section className="auth-split" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
      <div className="auth-split__image" />
      <div className="auth-split__card">
        <SignInForm />
      </div>
    </section>
  )
}
