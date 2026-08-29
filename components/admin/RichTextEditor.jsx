'use client'

import { useRef, useCallback, useState, useEffect } from 'react'

/* ─── Formatting helpers ─── */
const exec = (cmd, val) => document.execCommand(cmd, false, val || null)

function ToolbarBtn({ active, onClick, title, children }) {
  return (
    <button type="button" className={`rte-toolbar__btn${active ? ' rte-toolbar__btn--active' : ''}`} onClick={onClick} title={title}>
      {children}
    </button>
  )
}

function Sep() {
  return <span className="rte-toolbar__sep" />
}

function Select({ value, onChange, title, options }) {
  return (
    <select className="rte-toolbar__select" value={value} onChange={(e) => onChange(e.target.value)} title={title}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export default function RichTextEditor({ value = '', onChange, placeholder = 'Write something...' }) {
  const editorRef = useRef(null)
  const [activeBlock, setActiveBlock] = useState('p')
  const [activeFont, setActiveFont] = useState('')
  const [activeAlign, setActiveAlign] = useState('left')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)
  const [ol, setOl] = useState(false)
  const [ul, setUl] = useState(false)
  const fileRef = useRef(null)
  const ignoreNextInput = useRef(false)

  /* ── Set initial content ── */
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, []) // only on mount

  /* ── Sync external value changes (e.g. API data loaded) ── */
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== value) {
      ignoreNextInput.current = true
      el.innerHTML = value || ''
    }
  }, [value])

  /* ── Report content changes ── */
  const emitChange = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  /* ── Update toolbar active states ── */
  const refreshToolbar = useCallback(() => {
    setBold(document.queryCommandState('bold'))
    setItalic(document.queryCommandState('italic'))
    setUnderline(document.queryCommandState('underline'))
    setOl(document.queryCommandState('insertOrderedList'))
    setUl(document.queryCommandState('insertUnorderedList'))

    const block = document.queryCommandValue('formatBlock')
    setActiveBlock(block || 'p')

    const font = document.queryCommandValue('fontName').replace(/['"]/g, '')
    setActiveFont(font)

    const align = document.queryCommandValue('justifyCenter') ? 'center'
      : document.queryCommandValue('justifyRight') ? 'right'
      : document.queryCommandValue('justifyFull') ? 'justify'
      : 'left'
    setActiveAlign(align)
  }, [])

  /* ── Format block ── */
  const formatBlock = useCallback((tag) => {
    editorRef.current?.focus()
    document.execCommand('formatBlock', false, `<${tag}>`)
    refreshToolbar()
    emitChange()
  }, [refreshToolbar, emitChange])

  /* ── Set font family ── */
  const setFont = useCallback((font) => {
    editorRef.current?.focus()
    if (font) document.execCommand('fontName', false, font)
    else document.execCommand('removeFormat', false, null)
    refreshToolbar()
    emitChange()
  }, [refreshToolbar, emitChange])

  /* ── Simple toggle commands ── */
  const doCmd = useCallback((cmd) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, null)
    refreshToolbar()
    emitChange()
  }, [refreshToolbar, emitChange])

  /* ── Alignment ── */
  const doAlign = useCallback((cmd) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, null)
    refreshToolbar()
    emitChange()
  }, [refreshToolbar, emitChange])

  /* ── Link ── */
  const addLink = useCallback(() => {
    editorRef.current?.focus()
    const url = window.prompt('Enter URL:')
    if (url) document.execCommand('createLink', false, url)
    emitChange()
  }, [emitChange])

  /* ── Image upload (base64) ── */
  const handleImage = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { alert('Only JPG, PNG, WEBP allowed.'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5 MB.'); return }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })

    editorRef.current?.focus()
    document.execCommand('insertImage', false, dataUrl)
    emitChange()
    if (fileRef.current) fileRef.current.value = ''
  }, [emitChange])

  /* ── Handle paste: strip formatting, keep plain text + images ── */
  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain')
    document.execCommand('insertHTML', false, text)
    emitChange()
  }, [emitChange])

  return (
    <div className="rte">
      <div className="rte-toolbar">
        {/* ── Block format ── */}
        <Select
          value={activeBlock}
          onChange={formatBlock}
          title="Text style"
          options={[
            { value: 'p', label: 'Normal' },
            { value: 'h1', label: 'Heading 1' },
            { value: 'h2', label: 'Heading 2' },
            { value: 'h3', label: 'Heading 3' },
            { value: 'h4', label: 'Heading 4' },
            { value: 'h5', label: 'Heading 5' },
            { value: 'h6', label: 'Heading 6' },
          ]}
        />

        {/* ── Font family ── */}
        <Select
          value={activeFont}
          onChange={setFont}
          title="Font family"
          options={[
            { value: '', label: 'Default' },
            { value: 'sans-serif', label: 'Sans Serif' },
            { value: 'serif', label: 'Serif' },
            { value: 'monospace', label: 'Monospace' },
            { value: 'cursive', label: 'Cursive' },
          ]}
        />

        <Sep />

        {/* ── Text formatting ── */}
        <ToolbarBtn active={bold} onClick={() => doCmd('bold')} title="Bold"><strong>B</strong></ToolbarBtn>
        <ToolbarBtn active={italic} onClick={() => doCmd('italic')} title="Italic"><em>I</em></ToolbarBtn>
        <ToolbarBtn active={underline} onClick={() => doCmd('underline')} title="Underline"><span style={{ textDecoration: 'underline' }}>U</span></ToolbarBtn>

        <Sep />

        {/* ── Lists ── */}
        <ToolbarBtn active={ol} onClick={() => doCmd('insertOrderedList')} title="Ordered list">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="8" fontSize="8" fill="currentColor" stroke="none" fontFamily="sans-serif">1</text><text x="2" y="14" fontSize="8" fill="currentColor" stroke="none" fontFamily="sans-serif">2</text><text x="2" y="20" fontSize="8" fill="currentColor" stroke="none" fontFamily="sans-serif">3</text></svg>
        </ToolbarBtn>
        <ToolbarBtn active={ul} onClick={() => doCmd('insertUnorderedList')} title="Bullet list">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
        </ToolbarBtn>

        <Sep />

        <ToolbarBtn onClick={addLink} title="Insert link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </ToolbarBtn>

        <ToolbarBtn onClick={() => doCmd('removeFormat')} title="Clear formatting">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3H7l5 5"/><path d="M7 21h10"/><path d="M9.5 13.5L14 18"/><path d="M14 13.5L9.5 18"/></svg>
        </ToolbarBtn>

        <ToolbarBtn onClick={() => fileRef.current?.click()} title="Insert image">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </ToolbarBtn>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} style={{ display: 'none' }} />

        <Sep />

        {/* ── Alignment ── */}
        <ToolbarBtn active={activeAlign === 'left'} onClick={() => doAlign('justifyLeft')} title="Align left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={activeAlign === 'center'} onClick={() => doAlign('justifyCenter')} title="Align center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={activeAlign === 'right'} onClick={() => doAlign('justifyRight')} title="Align right">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={activeAlign === 'justify'} onClick={() => doAlign('justifyFull')} title="Justify">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </ToolbarBtn>
      </div>

      <div
        ref={editorRef}
        className="rte-editor"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => {
          if (ignoreNextInput.current) { ignoreNextInput.current = false; return }
          emitChange()
        }}
        onKeyUp={refreshToolbar}
        onMouseUp={refreshToolbar}
        onBlur={refreshToolbar}
        onPaste={handlePaste}
        style={{ minHeight: 250, padding: '1rem', outline: 'none', fontSize: '0.95rem', lineHeight: 1.7 }}
      />
    </div>
  )
}
