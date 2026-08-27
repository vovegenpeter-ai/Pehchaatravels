'use client'

import { useState, useEffect } from 'react'

function emptyDay(dayNum) {
  return { day: `Day ${dayNum}`, time: '', title: '', activities: [''] }
}

export default function ItineraryBuilder({ value = [], onChange }) {
  const [days, setDays] = useState(() => {
    if (value.length > 0) return value
    return []
  })

  // Sync when parent loads async data (e.g. editing an existing tour)
  useEffect(() => {
    setDays(value.length > 0 ? value : [])
  }, [value])

  const emit = (next) => {
    setDays(next)
    onChange(next)
  }

  const addDay = () => {
    const next = [...days, emptyDay(days.length + 1)]
    emit(next)
  }

  const removeDay = (idx) => {
    const next = days.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: `Day ${i + 1}` }))
    emit(next)
  }

  const updateDay = (idx, field, val) => {
    const next = days.map((d, i) => (i === idx ? { ...d, [field]: val } : d))
    emit(next)
  }

  const addActivity = (dayIdx) => {
    const next = days.map((d, i) =>
      i === dayIdx ? { ...d, activities: [...d.activities, ''] } : d
    )
    emit(next)
  }

  const updateActivity = (dayIdx, actIdx, val) => {
    const next = days.map((d, i) => {
      if (i !== dayIdx) return d
      const acts = [...d.activities]
      acts[actIdx] = val
      return { ...d, activities: acts }
    })
    emit(next)
  }

  const removeActivity = (dayIdx, actIdx) => {
    const next = days.map((d, i) => {
      if (i !== dayIdx) return d
      return { ...d, activities: d.activities.filter((_, j) => j !== actIdx) }
    })
    emit(next)
  }

  return (
    <div className="itinerary-builder">
      {days.map((day, dayIdx) => (
        <div key={dayIdx} className="itinerary-day-card">
          <div className="itinerary-day-card__header">
            <span className="itinerary-day-card__label">{day.day}</span>
            <button
              type="button"
              className="itinerary-btn itinerary-btn--danger itinerary-btn--sm"
              onClick={() => removeDay(dayIdx)}
            >
              ✕ Remove Day
            </button>
          </div>

          <div className="itinerary-day-card__fields">
            <div className="form-group">
              <label>Time</label>
              <input
                type="text"
                value={day.time}
                onChange={(e) => updateDay(dayIdx, 'time', e.target.value)}
                placeholder="07:00 AM"
              />
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={day.title}
                onChange={(e) => updateDay(dayIdx, 'title', e.target.value)}
                placeholder="Islamabad to Naran"
              />
            </div>
          </div>

          <div className="itinerary-day-card__activities">
            <label className="itinerary-day-card__activities-label">Activities</label>
            {day.activities.map((act, actIdx) => (
              <div key={actIdx} className="itinerary-activity-row">
                <input
                  type="text"
                  value={act}
                  onChange={(e) => updateActivity(dayIdx, actIdx, e.target.value)}
                  placeholder={`Activity ${actIdx + 1}`}
                />
                {day.activities.length > 1 && (
                  <button
                    type="button"
                    className="itinerary-btn itinerary-btn--danger itinerary-btn--icon"
                    onClick={() => removeActivity(dayIdx, actIdx)}
                    title="Remove activity"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="itinerary-btn itinerary-btn--add"
              onClick={() => addActivity(dayIdx)}
            >
              + Add Activity
            </button>
          </div>
        </div>
      ))}

      <button type="button" className="itinerary-btn itinerary-btn--primary" onClick={addDay}>
        + Add Day
      </button>
    </div>
  )
}
