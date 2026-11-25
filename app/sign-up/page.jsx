import SignUpForm from '@/components/SignUpForm'
import { HERO_IMAGE } from '@/lib/initialData'

export const metadata = {
  robots: { index: false, follow: false },
  title: 'Create an Account',
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
