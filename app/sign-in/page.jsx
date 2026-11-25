import SignInForm from '@/components/SignInForm'
import { HERO_IMAGE } from '@/lib/initialData'

export const metadata = {
  robots: { index: false, follow: false },
  title: 'Sign In',
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
