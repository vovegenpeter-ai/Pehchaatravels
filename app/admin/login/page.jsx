import { Suspense } from 'react'
import AdminLoginForm from './AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="admin-login-wrap"><div className="login-loading-spinner" /><p className="login-loading-text">Loading…</p></div>}>
      <AdminLoginForm />
    </Suspense>
  )
}
