import { Suspense } from 'react'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata = {
  title: 'Reset Password — Pehchaan Travels',
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<section className="auth-section"><div className="container"><div className="auth-card">Loading...</div></div></section>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
