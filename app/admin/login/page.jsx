import { Suspense } from 'react'
import AdminLoginForm from './AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="admin-login-wrap">Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  )
}
