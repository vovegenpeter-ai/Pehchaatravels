export default function AdminLoadingRow({ colSpan = 6 }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: 0 }}>
        <div className="admin-table-loading">
          <div className="page-spinner page-spinner--sm" />
          <span className="admin-table-loading__text">Loading…</span>
        </div>
      </td>
    </tr>
  )
}
