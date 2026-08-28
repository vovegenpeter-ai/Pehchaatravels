'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import AdminNav from '@/components/AdminNav'
import '../globals.css'
import './admin.css'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  useEffect(() => {
    if (!isLogin) {
      document.body.classList.add('admin-page')
      return () => document.body.classList.remove('admin-page')
    }
  }, [isLogin])

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
