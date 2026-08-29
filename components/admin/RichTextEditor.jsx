'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { useState, useCallback, useRef, useEffect } from 'react'

/* ─── Toolbar button ─── */
function ToolbarBtn({ active, disabled, onClick, title, children }) {
  return (
    <button
      type="button"
      className={`rte-toolbar__btn${active ? ' rte-toolbar__btn--active' : ''}`}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

/* ─── Separator ─── */
function Sep() {
  return <span className="rte-toolbar__sep" />
}

/* ─── Main Editor ─── */
export default function RichTextEditor({ value = '', onChange, placeholder = 'Write something...' }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)
  const [, setTick] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image.configure({ HTMLAttributes: { class: 'rte-image', style: 'max-width:100%;height:auto;' } }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
      setTick((n) => n + 1)
    },
    onSelectionUpdate: () => {
      setTick((n) => n + 1)
    },
  })

  /* ── Image upload ── */
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    setUploadError('')
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { setUploadError('Only JPG, PNG, and WEBP images are allowed.'); return }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Image must be under 5 MB.'); return }
    setUploading(true)
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
      editor.chain().focus().setImage({ src: dataUrl }).run()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [editor])

  /* ── Link ── */
  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('Enter URL:', prev)
    if (url === null) return
    if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  /* Read live state from editor on every render */
  const currentFont = editor.getAttributes('textStyle').fontFamily || ''
  const currentLevel = editor.getAttributes('heading').level || 0
  const currentAlign = editor.isActive({ textAlign: 'center' }) ? 'center'
    : editor.isActive({ textAlign: 'right' }) ? 'right'
    : editor.isActive({ textAlign: 'justify' }) ? 'justify'
    : 'left'

  /* ── Font family cycle button ── */
  const fontOptions = [
    { value: '', label: 'Default' },
    { value: 'sans-serif', label: 'Sans' },
    { value: 'serif', label: 'Serif' },
    { value: 'monospace', label: 'Mono' },
    { value: 'cursive', label: 'Cursive' },
  ]
  const currentFontLabel = fontOptions.find(f => f.value === currentFont)?.label || 'Default'
  const cycleFont = () => {
    const idx = fontOptions.findIndex(f => f.value === currentFont)
    const next = fontOptions[(idx + 1) % fontOptions.length]
    const chain = editor.chain()
    if (next.value) chain.setFontFamily(next.value)
    else chain.unsetFontFamily()
    chain.focus().run()
  }

  return (
    <div className="rte">
      <div className="rte-toolbar">
        {/* ── Heading buttons (same pattern as Bold — reliable onClick) ── */}
        <ToolbarBtn
          active={currentLevel === 0}
          onClick={() => { editor.chain().focus().setParagraph().run() }}
          title="Normal text"
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>¶</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={currentLevel === 1}
          onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run() }}
          title="Heading 1"
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>H1</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={currentLevel === 2}
          onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run() }}
          title="Heading 2"
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>H2</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={currentLevel === 3}
          onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run() }}
          title="Heading 3"
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>H3</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={currentLevel === 4}
          onClick={() => { editor.chain().focus().toggleHeading({ level: 4 }).run() }}
          title="Heading 4"
        >
          <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>H4</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={currentLevel === 5}
          onClick={() => { editor.chain().focus().toggleHeading({ level: 5 }).run() }}
          title="Heading 5"
        >
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>H5</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={currentLevel === 6}
          onClick={() => { editor.chain().focus().toggleHeading({ level: 6 }).run() }}
          title="Heading 6"
        >
          <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>H6</span>
        </ToolbarBtn>

        <Sep />

        {/* ── Font family cycle button ── */}
        <ToolbarBtn onClick={cycleFont} title={`Font: ${currentFontLabel} (click to cycle)`}>
          <span style={{ fontSize: '0.72rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{currentFontLabel}</span>
        </ToolbarBtn>

        <Sep />

        {/* ── Text formatting ── */}
        <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <span style={{ textDecoration: 'underline' }}>U</span>
        </ToolbarBtn>

        <Sep />

        <ToolbarBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="8" fontSize="8" fill="currentColor" stroke="none" fontFamily="sans-serif">1</text><text x="2" y="14" fontSize="8" fill="currentColor" stroke="none" fontFamily="sans-serif">2</text><text x="2" y="20" fontSize="8" fill="currentColor" stroke="none" fontFamily="sans-serif">3</text></svg>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
        </ToolbarBtn>

        <Sep />

        <ToolbarBtn active={editor.isActive('link')} onClick={setLink} title="Insert link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </ToolbarBtn>

        <ToolbarBtn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>&lt;/&gt;</span>
        </ToolbarBtn>

        <Sep />

        <ToolbarBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3H7l5 5"/><path d="M7 21h10"/><path d="M9.5 13.5L14 18"/><path d="M14 13.5L9.5 18"/></svg>
        </ToolbarBtn>

        <ToolbarBtn onClick={() => fileInputRef.current?.click()} title="Insert image" disabled={uploading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </ToolbarBtn>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} style={{ display: 'none' }} />
        {uploading && <span className="rte-toolbar__status">Uploading…</span>}

        <Sep />

        <ToolbarBtn active={currentAlign === 'left'} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={currentAlign === 'center'} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={currentAlign === 'right'} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align right">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn active={currentAlign === 'justify'} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justify">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </ToolbarBtn>
      </div>

      {uploadError && <div className="rte-error">{uploadError}</div>}

      <EditorContent editor={editor} className="rte-content" />
    </div>
  )
}
