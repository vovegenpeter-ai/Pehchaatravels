'use client'

import { useState, useRef } from 'react'

/**
 * Admin editor for a tour's "Points to Cover" highlights.
 * Each point has a label and an enabled flag; points can be added,
 * removed, reordered (↑/↓) and toggled on/off. Order here is the
 * display order on the tour detail page.
 */
export default function PointsBuilder({ value = [], onChange }) {
  const [draft, setDraft] = useState('')
  const points = Array.isArray(value) ? value : []
  /* Mirror of `points` so rapid adds (batched renders) can't overwrite each other. */
  const pointsRef = useRef(points)
  pointsRef.current = points

  const addPoint = () => {
    const label = draft.trim()
    if (!label) return
    onChange([
      ...pointsRef.current,
      { id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, label, enabled: true },
    ])
    setDraft('')
  }

  const removePoint = (id) => {
    onChange(points.filter((p) => p.id !== id))
  }

  const updatePoint = (id, patch) => {
    onChange(points.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const movePoint = (index, dir) => {
    const to = index + dir
    if (to < 0 || to >= points.length) return
    const next = [...points]
    const [item] = next.splice(index, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div className="points-builder">
      <div className="points-builder__add">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addPoint()
            }
          }}
          placeholder="e.g. Saif-ul-Mulook Lake"
        />
        <button type="button" className="itinerary-btn itinerary-btn--primary" onClick={addPoint}>
          + Add Point
        </button>
      </div>
      <p className="points-builder__hint">
        Shown as chips in the &quot;Points to Cover&quot; section on the destination page. Use ↑/↓ to reorder, the
        toggle to show/hide a point without deleting it.
      </p>

      {points.length === 0 ? (
        <p className="points-builder__empty">No points added yet.</p>
      ) : (
        <ul className="points-builder__list">
          {points.map((p, i) => (
            <li key={p.id} className={`points-builder__row${p.enabled ? '' : ' points-builder__row--disabled'}`}>
              <div className="points-builder__order">
                <button
                  type="button"
                  className="itinerary-btn itinerary-btn--sm"
                  onClick={() => movePoint(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="itinerary-btn itinerary-btn--sm"
                  onClick={() => movePoint(i, 1)}
                  disabled={i === points.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </button>
              </div>
              <input
                type="text"
                className="points-builder__label"
                value={p.label}
                onChange={(e) => updatePoint(p.id, { label: e.target.value })}
                placeholder="Point name"
              />
              <label className="points-builder__toggle" title="Show/hide on destination page">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) => updatePoint(p.id, { enabled: e.target.checked })}
                />
                <span>{p.enabled ? 'Visible' : 'Hidden'}</span>
              </label>
              <button
                type="button"
                className="itinerary-btn itinerary-btn--danger itinerary-btn--sm"
                onClick={() => removePoint(p.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
