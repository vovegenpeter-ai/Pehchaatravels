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
import { useState, useCallback, useRef } from 'react'

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

/* ─── Dropdown helper ─── */
function ToolbarSelect({ value, onChange, title, options }) {
  return (
    <select
      className="rte-toolbar__select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={title}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
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
  const [activeFontFamily, setActiveFontFamily] = useState('')
  const [activeHeadingLevel, setActiveHeadingLevel] = useState(0)
  const [activeTextAlign, setActiveTextAlign] = useState('left')
  const [activeMarks, setActiveMarks] = useState({})
  const [activeNodes, setActiveNodes] = useState({})

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
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
    },
    onTransaction: ({ editor: ed }) => {
      setActiveFontFamily(ed.getAttributes('textStyle').fontFamily || '')
      setActiveHeadingLevel(ed.getAttributes('heading').level || 0)
      setActiveTextAlign(ed.isActive({ textAlign: 'center' }) ? 'center' : ed.isActive({ textAlign: 'right' }) ? 'right' : ed.isActive({ textAlign: 'justify' }) ? 'justify' : 'left')
      setActiveMarks({
        bold: ed.isActive('bold'),
        italic: ed.isActive('italic'),
        underline: ed.isActive('underline'),
        link: ed.isActive('link'),
        code: ed.isActive('code'),
        codeBlock: ed.isActive('codeBlock'),
        orderedList: ed.isActive('orderedList'),
        bulletList: ed.isActive('bulletList'),
      })
      setActiveNodes({
        image: ed.isActive('image'),
      })
    },
  })

  /* ── Image upload ── */
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    setUploadError('')

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setUploadError('Only JPG, PNG, and WEBP images are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5 MB.')
      return
    }

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
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="rte">
      {/* ── Toolbar ── */}
      <div className="rte-toolbar">
        {/* Text style */}
        <ToolbarSelect
          value={activeHeadingLevel ? `h${activeHeadingLevel}` : 'p'}
          onChange={(v) => {
            setTimeout(() => {
              if (v === 'p') editor.chain().focus().setParagraph().run()
              else editor.chain().focus().toggleHeading({ level: Number(v) }).run()
            }, 0)
          }}
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

        {/* Font family */}
        <ToolbarSelect
          value={activeFontFamily}
          onChange={(v) => {
            setTimeout(() => {
              if (v) editor.chain().focus().setFontFamily(v).run()
              else editor.chain().focus().unsetFontFamily().run()
            }, 0)
          }}
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

        {/* Bold / Italic / Underline */}
        <ToolbarBtn
          active={activeMarks.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn
          active={activeMarks.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn
          active={activeMarks.underline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </ToolbarBtn>

        <Sep />

        {/* Ordered list / Unordered list */}
        <ToolbarBtn
          active={activeMarks.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered list"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="8" fontSize="8" fill="currentColor" stroke="none" fontFamily="sans-serif">1</text><text x="2" y="14" fontSize="8" fill="currentColor" stroke="none" fontFamily="sans-serif">2</text><text x="2" y="20" fontSize="8" fill="currentColor" stroke="none" fontFamily="sans-serif">3</text></svg>
        </ToolbarBtn>
        <ToolbarBtn
          active={activeMarks.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
        </ToolbarBtn>

        <Sep />

        {/* Link */}
        <ToolbarBtn
          active={activeMarks.link}
          onClick={setLink}
          title="Insert link"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </ToolbarBtn>

        {/* Code */}
        <ToolbarBtn
          active={activeMarks.code}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline code"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn
          active={activeMarks.codeBlock}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code block"
        >
          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>&lt;/&gt;</span>
        </ToolbarBtn>

        <Sep />

        {/* Clear formatting */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear formatting"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3H7l5 5"/><path d="M7 21h10"/><path d="M9.5 13.5L14 18"/><path d="M14 13.5L9.5 18"/></svg>
        </ToolbarBtn>

        {/* Image */}
        <ToolbarBtn
          onClick={() => fileInputRef.current?.click()}
          title="Insert image"
          disabled={uploading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </ToolbarBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        {uploading && <span className="rte-toolbar__status">Uploading…</span>}

        <Sep />

        {/* Alignment */}
        <ToolbarBtn
          active={activeTextAlign === 'left'}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn
          active={activeTextAlign === 'center'}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn
          active={activeTextAlign === 'right'}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align right"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
        </ToolbarBtn>
        <ToolbarBtn
          active={activeTextAlign === 'justify'}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="Justify"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </ToolbarBtn>
      </div>

      {/* ── Error ── */}
      {uploadError && <div className="rte-error">{uploadError}</div>}

      {/* ── Editor ── */}
      <EditorContent editor={editor} className="rte-content" />
    </div>
  )
}
