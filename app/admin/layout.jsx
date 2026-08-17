'use client'

import { usePathname } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import '../globals.css'
import './admin.css'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-main">{children}</main>
    </div>
  )
}
