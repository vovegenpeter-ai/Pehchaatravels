export default function AdminLoadingRow({ colSpan = 6 }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem 1rem' }}>
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} style={{ display: 'flex', gap: '1rem', marginBottom: row < 5 ? '1rem' : 0, alignItems: 'center' }}>
              {Array.from({ length: Math.min(colSpan, 6) }, (_, col) => (
                <div
                  key={col}
                  className="skeleton-shimmer"
                  style={{
                    height: 14,
                    flex: col === 0 ? '0 0 100px' : col === colSpan - 1 ? '0 0 80px' : 1,
                    borderRadius: 4,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </td>
    </tr>
  )
}
