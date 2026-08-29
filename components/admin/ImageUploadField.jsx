'use client'

import { useState } from 'react'
import { fetchJson } from '@/lib/fetchJson'

export default function ImageUploadField({ label, value, onChange, name }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await fetchJson('/api/admin/upload', { method: 'POST', body: formData })
      onChange({ target: { name, value: data.url } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="form-group form-group--full">
      <label>{label}</label>
      <div className="image-upload-field">
        <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
        {uploading && <span className="upload-status">Uploading...</span>}
        {error && <span className="upload-error">{error}</span>}
        {value && <img src={value} alt="Preview" className="image-upload-preview" />}
      </div>
    </div>
  )
}
