import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Pagination from '@/components/admin/Pagination'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

function formatDate(date) {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return String(date)
  }
}

export default async function AdminUsersPage({ searchParams }) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params?.page, 10) || 1)
  const search = (params?.search || '').trim()

  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}

  const total = await prisma.user.count({ where })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      createdAt: true,
    },
  })

  const start = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const end = Math.min(safePage * PAGE_SIZE, total)

  return (
    <>
      <div className="admin-header">
        <h1>Users</h1>
        <span className="cq-summary">{total} registered user{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Search bar */}
      <form method="get" className="cq-toolbar" style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          name="search"
          className="cq-search"
          placeholder="Search by name, email or phone…"
          defaultValue={search}
        />
        <button type="submit" className="btn btn--primary btn--sm">Search</button>
        {search && (
          <Link href="/admin/users" className="btn btn--outline btn--sm">Clear</Link>
        )}
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="admin-table__empty">
                  {search ? 'No users match your search.' : 'No users registered yet.'}
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user.id}>
                  <td>{start + idx}</td>
                  <td>{user.fullName}</td>
                  <td>
                    <a href={`mailto:${user.email}`} className="cq-link">{user.email}</a>
                  </td>
                  <td>{user.phone}</td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="admin-pagination__row">
          <span className="admin-pagination__info">
            {search
              ? `${total} result${total !== 1 ? 's' : ''} — Showing ${start}–${end}`
              : `Showing ${start}–${end} of ${total}`}
          </span>
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            basePath="/admin/users"
            extraParams={search ? { search } : undefined}
          />
        </div>
      )}
    </>
  )
}
