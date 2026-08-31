'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import AdminLoadingRow from '@/components/admin/AdminLoadingRow'

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')

  // Confirm dialogs
  const [confirmBlock, setConfirmBlock] = useState(null)   // user obj
  const [confirmDelete, setConfirmDelete] = useState(null)  // user obj

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      if (appliedSearch) params.set('search', appliedSearch)
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users)
      setTotal(data.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, appliedSearch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  /* Block / Unblock */
  const handleBlock = async (user) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed to update user')
      await fetchUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  /* Delete */
  const handleDelete = async (user) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete user')
      // If deleting the last item on the current page, go back a page
      if (users.length === 1 && page > 1) setPage(page - 1)
      else await fetchUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    setAppliedSearch(search.trim())
  }

  const handleClearSearch = () => {
    setSearch('')
    setPage(1)
    setAppliedSearch('')
  }

  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)

  return (
    <>
      <div className="admin-header">
        <h1>Users</h1>
        <span className="cq-summary">{total} registered user{total !== 1 ? 's' : ''}</span>
      </div>

      {error && <div className="cq-error">{error}</div>}

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="cq-toolbar" style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="cq-search"
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn--primary btn--sm">Search</button>
        {appliedSearch && (
          <button type="button" onClick={handleClearSearch} className="btn btn--outline btn--sm">
            Clear
          </button>
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
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <AdminLoadingRow cols={7} />
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-table__empty">
                  {appliedSearch ? 'No users match your search.' : 'No users registered yet.'}
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user.id} style={user.blocked ? { opacity: 0.6 } : undefined}>
                  <td>{start + idx}</td>
                  <td>{user.fullName}</td>
                  <td>
                    <a href={`mailto:${user.email}`} className="cq-link">{user.email}</a>
                  </td>
                  <td>{user.phone}</td>
                  <td>
                    {user.blocked ? (
                      <span className="cq-status cq-status--rejected">Blocked</span>
                    ) : (
                      <span className="cq-status cq-status--confirmed">Active</span>
                    )}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="cq-actions">
                      <button
                        type="button"
                        className={`btn btn--sm ${user.blocked ? 'btn--primary' : 'btn--outline'}`}
                        onClick={() => setConfirmBlock(user)}
                      >
                        {user.blocked ? 'Unblock' : 'Block'}
                      </button>
                      <button
                        type="button"
                        className="btn btn--sm btn--danger"
                        onClick={() => setConfirmDelete(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="admin-pagination__row">
          <span className="admin-pagination__info">
            {appliedSearch
              ? `${total} result${total !== 1 ? 's' : ''} — Showing ${start}–${end}`
              : `Showing ${start}–${end} of ${total}`}
          </span>
          <div className="admin-pagination">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="admin-pagination__btn"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`admin-pagination__btn ${p === page ? 'admin-pagination__btn--active' : ''}`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="admin-pagination__btn"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Block/Unblock Dialog */}
      <ConfirmDialog
        open={!!confirmBlock}
        title={confirmBlock?.blocked ? 'Unblock User' : 'Block User'}
        message={
          confirmBlock?.blocked
            ? `Are you sure you want to unblock "${confirmBlock?.fullName}"? They will be able to use the platform again.`
            : `Are you sure you want to block "${confirmBlock?.fullName}"? They will no longer be able to access the platform.`
        }
        confirmLabel={confirmBlock?.blocked ? 'Unblock' : 'Block'}
        danger={false}
        onConfirm={() => {
          const user = confirmBlock
          setConfirmBlock(null)
          handleBlock(user)
        }}
        onCancel={() => setConfirmBlock(null)}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete User"
        message={`Are you sure you want to permanently delete "${confirmDelete?.fullName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          const user = confirmDelete
          setConfirmDelete(null)
          handleDelete(user)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  )
}
