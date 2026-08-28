'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import AdminNav from '@/components/AdminNav'
import '../globals.css'
import './admin.css'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'
  const layoutRef = useRef(null)

  useEffect(() => {
    if (!isLogin) {
      document.body.classList.add('admin-page')
      return () => document.body.classList.remove('admin-page')
    }
  }, [isLogin])

  useEffect(() => {
    if (isLogin) return
    const el = layoutRef.current
    if (!el) return

    const handleWheel = (e) => {
      const sidebar = el.querySelector('.admin-nav')
      const main = el.querySelector('.admin-main')
      if (!sidebar || !main) return

      const rect = el.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const isOverSidebar = mouseX < sidebar.offsetWidth
      const target = isOverSidebar ? sidebar : main

      const atTop = target.scrollTop <= 0
      const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1

      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
        return
      }

      e.preventDefault()
      target.scrollTop += e.deltaY
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [isLogin])

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="admin-layout" ref={layoutRef}>
      <AdminNav />
      <main className="admin-main">{children}</main>
    </div>
  )
}
