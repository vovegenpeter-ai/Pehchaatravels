import { Suspense } from 'react'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata = {
  title: 'Reset Password — Pehchaan Travels',
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<section className="auth-section"><div className="container"><div className="auth-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem' }}><div className="page-spinner page-spinner--sm" /><span style={{ color: '#94a3b8' }}>Loading…</span></div></div></section>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
