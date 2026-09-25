'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { compressImage } from '@/lib/compressImage'
import { fetchJson } from '@/lib/fetchJson'
import { isTempUri, extractTempImageUris, hasUnmigratedTempImages } from '@/lib/editorImages'

/* ─── Helpers ─── */

/**
 * Convert a data-URI image (base64 or url-encoded) into a File so it can be
 * uploaded to Cloudinary instead of living inside the description HTML.
 * Without this, pasted screenshots embed megabytes of base64 into the JSON
 * payload and the save request fails with "Unterminated string in JSON".
 */
/* 1x1 transparent GIF used as a temporary placeholder while uploading */
const PLACEHOLDER_SRC = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

/* ─── Small sub-components ─── */
function ToolbarBtn({ active, onClick, title, children, className = '' }) {
  return (
    <button
      type="button"
      className={`rte-toolbar__btn${active ? ' rte-toolbar__btn--active' : ''} ${className}`}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      title={title}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="rte-toolbar__sep" />
}

/**
 * Select wrapper that saves/restores editor selection on mousedown.
 * This prevents the dropdown from stealing focus and losing the user's
 * text selection inside the contentEditable editor.
 */
function EditorSelect({ editorRef, value, onChange, title, options, className = '' }) {
  const savedRange = useRef(null)

  const handleMouseDown = useCallback((e) => {
    /* Save the current editor selection before the select steals focus */
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange()
    }
  }, [editorRef])

  const handleChange = useCallback((e) => {
    const newValue = e.target.value

    /* Focus editor first, then restore selection */
    editorRef.current?.focus()
    if (savedRange.current) {
      requestAnimationFrame(() => {
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(savedRange.current)
        onChange(newValue)
      })
    } else {
      onChange(newValue)
    }
  }, [editorRef, onChange])

  return (
    <select
      className={`rte-toolbar__select ${className}`}
      value={value}
      onChange={handleChange}
      onMouseDown={handleMouseDown}
      title={title}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function ColorButton({ color, onChange, title, icon }) {
  const inputRef = useRef(null)
  return (
    <button
      type="button"
      className="rte-toolbar__btn rte-toolbar__color-btn"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
    >
      {icon}
      <span className="rte-toolbar__color-bar" style={{ backgroundColor: color || '#000' }} />
      <input
        ref={inputRef}
        type="color"
        value={color || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
      />
    </button>
  )
}

export default function RichTextEditor({ value = '', onChange, placeholder = 'Write something...' }) {
  const editorRef = useRef(null)
  const [activeBlock, setActiveBlock] = useState('p')
  const [activeFont, setActiveFont] = useState('Arial')
  const [activeAlign, setActiveAlign] = useState('left')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)
  const [ol, setOl] = useState(false)
  const [ul, setUl] = useState(false)
  const [taskList, setTaskList] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [textColor, setTextColor] = useState('#000000')
  const [highlightColor, setHighlightColor] = useState('#FFFF00')
  const [strike, setStrike] = useState(false)
  const [pasteStatus, setPasteStatus] = useState('')
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

  /* ── Get the block-level element at the current cursor position ── */
  const getCurrentBlock = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return null
    let node = sel.anchorNode
    if (node && node.nodeType === 3) node = node.parentElement
    while (node && node !== editorRef.current) {
      const tag = node.tagName
      if (tag === 'P' || tag === 'DIV' || tag === 'H1' || tag === 'H2' || tag === 'H3' ||
          tag === 'H4' || tag === 'H5' || tag === 'H6' || tag === 'BLOCKQUOTE' || tag === 'LI' ||
          tag === 'TD' || tag === 'TH') {
        return node
      }
      node = node.parentElement
    }
    return null
  }, [])

  /* ── Detect font size from current selection ── */
  const detectFontSize = useCallback(() => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const node = sel.anchorNode?.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode
      if (node && editorRef.current?.contains(node)) {
        const computed = window.getComputedStyle(node).fontSize
        if (computed) setFontSize(parseInt(computed, 10) || 14)
      }
    }
  }, [])

  /* ── Update toolbar active states ── */
  const refreshToolbar = useCallback(() => {
    setBold(document.queryCommandState('bold'))
    setItalic(document.queryCommandState('italic'))
    setUnderline(document.queryCommandState('underline'))
    setStrike(document.queryCommandState('strikeThrough'))
    setOl(document.queryCommandState('insertOrderedList'))
    setUl(document.queryCommandState('insertUnorderedList'))

    const block = document.queryCommandValue('formatBlock')
    setActiveBlock(block || 'p')

    const font = document.queryCommandValue('fontName').replace(/['"]/g, '')
    if (font) setActiveFont(font)

    /* Detect alignment from the current block element's style */
    const alignBlock = getCurrentBlock()
    const blockAlign = alignBlock ? (alignBlock.style.textAlign || '') : ''
    const align = blockAlign || (editorRef.current?.style.textAlign || '')
    setActiveAlign(align || 'left')

    detectFontSize()
  }, [detectFontSize, getCurrentBlock])

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

  /* ── Alignment — uses direct style.textAlign for reliability ── */
  const doAlign = useCallback((alignValue) => {
    editorRef.current?.focus()
    const block = getCurrentBlock()
    if (block) {
      block.style.textAlign = alignValue
    } else {
      /* Fallback: wrap content in a div with alignment */
      editorRef.current.style.textAlign = alignValue
    }
    refreshToolbar()
    emitChange()
  }, [getCurrentBlock, refreshToolbar, emitChange])

  /* ── Font size: set to specific value ── */
  const setFontSizeValue = useCallback((size) => {
    editorRef.current?.focus()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const newSize = Math.max(8, Math.min(96, size))

    if (!sel.isCollapsed) {
      const range = sel.getRangeAt(0)
      const span = document.createElement('span')
      span.style.fontSize = newSize + 'px'
      try {
        range.surroundContents(span)
      } catch {
        const fragment = range.extractContents()
        span.appendChild(fragment)
        range.insertNode(span)
      }
      sel.removeAllRanges()
      const newRange = document.createRange()
      newRange.selectNodeContents(span)
      sel.addRange(newRange)
    } else {
      const span = document.createElement('span')
      span.style.fontSize = newSize + 'px'
      span.innerHTML = '\u200B'
      const range = sel.getRangeAt(0)
      range.deleteContents()
      range.insertNode(span)
      const newRange = document.createRange()
      newRange.setStart(span.firstChild, 1)
      newRange.collapse(true)
      sel.removeAllRanges()
      sel.addRange(newRange)
    }
    setFontSize(newSize)
    emitChange()
  }, [emitChange])

  /* ── Font size increase/decrease ── */
  const changeFontSize = useCallback((delta) => {
    const newSize = Math.max(8, Math.min(96, fontSize + delta))
    setFontSizeValue(newSize)
  }, [fontSize, setFontSizeValue])

  /* ── Text color ── */
  const applyTextColor = useCallback((color) => {
    editorRef.current?.focus()
    document.execCommand('foreColor', false, color)
    setTextColor(color)
    emitChange()
  }, [emitChange])

  /* ── Highlight color ── */
  const applyHighlight = useCallback((color) => {
    editorRef.current?.focus()
    document.execCommand('hiliteColor', false, color)
    setHighlightColor(color)
    emitChange()
  }, [emitChange])

  /* ── Line spacing ── */
  const setLineSpacing = useCallback((val) => {
    editorRef.current?.focus()
    document.execCommand('lineHeight', false, val)
    emitChange()
  }, [emitChange])

  /* ── Indent / Outdent ── */
  const doIndent = useCallback(() => {
    editorRef.current?.focus()
    document.execCommand('indent', false, null)
    emitChange()
  }, [emitChange])

  const doOutdent = useCallback(() => {
    editorRef.current?.focus()
    document.execCommand('outdent', false, null)
    emitChange()
  }, [emitChange])

  /* ── Task list (checkbox list) ── */
  const toggleTaskList = useCallback(() => {
    editorRef.current?.focus()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    let node = sel.anchorNode
    while (node && node !== editorRef.current) {
      if (node.tagName === 'LI') break
      if (node.tagName === 'P' || node.tagName === 'DIV') break
      node = node.parentElement
    }

    if (taskList) {
      document.execCommand('insertUnorderedList', false, null)
      setTaskList(false)
    } else {
      document.execCommand('insertUnorderedList', false, null)
      const listNode = node?.tagName === 'LI' ? node : editorRef.current?.querySelector('li:last-child')
      if (listNode && !listNode.querySelector('input[type="checkbox"]')) {
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.style.marginRight = '0.5rem'
        checkbox.style.cursor = 'pointer'
        checkbox.disabled = true
        listNode.prepend(checkbox)
        listNode.style.listStyle = 'none'
        listNode.style.marginLeft = '-1.5rem'
      }
      setTaskList(true)
    }
    emitChange()
  }, [taskList, emitChange])

  /* ── Link ── */
  const addLink = useCallback(() => {
    editorRef.current?.focus()
    const sel = window.getSelection()
    const selectedText = sel?.toString() || ''
    const url = window.prompt('Enter URL:', 'https://')
    if (url) {
      if (selectedText) {
        document.execCommand('createLink', false, url)
      } else {
        document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${url}</a>`)
      }
    }
    emitChange()
  }, [emitChange])

  /* ── Upload one File to Cloudinary, compressing big images first ── */
  const uploadFileToCloudinary = useCallback(async (file) => {
    let uploadFile = file
    if (file.size > 200 * 1024) {
      try { uploadFile = await compressImage(file) } catch { /* keep original */ }
    }
    const formData = new FormData()
    formData.append('file', uploadFile)
    const data = await fetchJson('/api/admin/upload', { method: 'POST', body: formData })
    return data.url
  }, [])

  /* ── Convert a data/blob/file URI image into a File for Cloudinary upload ── */
  const uploadTempUriImage = useCallback(async (uri) => {
    const blob = await (await fetch(uri)).blob()
    const ext = (blob.type.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '') || 'png'
    const file = new File([blob], `embedded-image.${ext}`, { type: blob.type || 'image/png' })
    return uploadFileToCloudinary(file)
  }, [uploadFileToCloudinary])

  /* ── Upload image File(s) and insert them at the cursor ── */
  const uploadAndInsertFiles = useCallback((files) => {
    if (!files.length) return
    setPasteStatus(`Uploading ${files.length} image${files.length > 1 ? 's' : ''}…`)
    Promise.all(files.map((file) => uploadFileToCloudinary(file)))
      .then((urls) => {
        editorRef.current?.focus()
        urls.forEach((url) => document.execCommand('insertImage', false, url))
        setPasteStatus('')
        emitChange()
      })
      .catch(() => {
        setPasteStatus('Image upload failed — please try again')
        setTimeout(() => setPasteStatus(''), 4000)
      })
  }, [uploadFileToCloudinary, emitChange])

  /* ── Image upload via toolbar (Cloudinary URL instead of base64) ── */
  const handleImage = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please upload a valid image file.'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5 MB.'); return }

    try {
      editorRef.current?.focus()
      await uploadAndInsertFiles([file])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [uploadAndInsertFiles])

  /* ── Tokenize temp images in parsed HTML: swap each data:/blob:/file: src
     for a unique placeholder so uploads can target the right <img> later ── */
  const tokenizeTempImages = (tpl) => {
    const tokenByUri = new Map()
    let idx = 0
    tpl.content.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src')
      if (isTempUri(src)) {
        if (!tokenByUri.has(src)) {
          tokenByUri.set(src, `rteimg-${Date.now()}-${idx}`)
          idx += 1
        }
        img.src = PLACEHOLDER_SRC
        img.setAttribute('data-rte-temp', tokenByUri.get(src))
      }
    })
    return tokenByUri
  }

  /* ── Run the Cloudinary uploads for a token map and swap each placeholder
     for the CDN URL (failed uploads remove their placeholder) ── */
  const runTempImageUploads = useCallback((tokenByUri) => {
    const swap = (token, apply) => {
      const els = editorRef.current?.querySelectorAll(`img[data-rte-temp="${token}"]`) || []
      els.forEach((el) => apply(el))
    }

    let failures = 0
    let done = 0
    tokenByUri.forEach((token, uri) => {
      uploadTempUriImage(uri)
        .then((url) => {
          swap(token, (el) => {
            el.src = url
            el.removeAttribute('data-rte-temp')
            el.removeAttribute('srcset')
          })
        })
        .catch(() => {
          failures += 1
          swap(token, (el) => el.remove())
        })
        .finally(() => {
          done += 1
          if (done === tokenByUri.size) {
            if (failures) {
              setPasteStatus(`Uploaded ${tokenByUri.size - failures}/${tokenByUri.size} images — failed ones were removed`)
              setTimeout(() => setPasteStatus(''), 5000)
            } else {
              setPasteStatus('')
            }
            emitChange()
          }
        })
    })
  }, [emitChange, uploadTempUriImage])

  /* ── Migrate temp images inside pasted/dropped `html`, inserting the result
     at the cursor ── */
  const migrateTempImages = useCallback((html) => {
    const tpl = document.createElement('template')
    tpl.innerHTML = html
    const tokenByUri = tokenizeTempImages(tpl)

    if (!tokenByUri.size) {
      document.execCommand('insertHTML', false, html)
      emitChange()
      return 0
    }

    setPasteStatus(`Uploading ${tokenByUri.size} image${tokenByUri.size > 1 ? 's' : ''}…`)
    document.execCommand('insertHTML', false, tpl.innerHTML)
    emitChange()
    runTempImageUploads(tokenByUri)
    return tokenByUri.size
  }, [emitChange, runTempImageUploads])

  /* ── Handle paste: clean paste + upload embedded images to Cloudinary ── */
  const handlePaste = useCallback((e) => {
    e.preventDefault()

    /* Screenshots copied straight to the clipboard arrive as files */
    const imageFiles = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith('image/'))
    if (imageFiles.length) {
      uploadAndInsertFiles(imageFiles)
      return
    }

    const html = e.clipboardData.getData('text/html')
    const text = e.clipboardData.getData('text/plain')

    if (!html) {
      document.execCommand('insertText', false, text)
      emitChange()
      return
    }

    /* Strip scripts/styles, then let migrateTempImages handle any embedded
       images (they are uploaded to Cloudinary and swapped in automatically). */
    const cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    migrateTempImages(cleaned)
  }, [emitChange, migrateTempImages, uploadAndInsertFiles])

  /* ── Handle drag & drop: image files, or HTML carrying temp images ── */
  const handleDrop = useCallback((e) => {
    const files = [...(e.dataTransfer?.files || [])].filter((f) => f.type.startsWith('image/'))
    if (files.length) {
      e.preventDefault()
      uploadAndInsertFiles(files)
      return
    }
    /* Dragging images from another page/tab arrives as HTML, not files */
    const html = e.dataTransfer?.getData?.('text/html')
    if (html && extractTempImageUris(html).length) {
      e.preventDefault()
      editorRef.current?.focus()
      migrateTempImages(html)
    }
  }, [uploadAndInsertFiles, migrateTempImages])

  /* ── Legacy content: migrate embedded data:/blob:/file: images to
     Cloudinary when such content is loaded into the editor (e.g. records
     created before images were uploaded automatically). Runs in place — no
     focus steal, no cursor insertion. ── */
  const migrateLoadedContent = useCallback((el, html) => {
    const tpl = document.createElement('template')
    tpl.innerHTML = html
    const tokenByUri = tokenizeTempImages(tpl)
    if (!tokenByUri.size) return false

    el.innerHTML = tpl.innerHTML
    setPasteStatus(`Uploading ${tokenByUri.size} image${tokenByUri.size > 1 ? 's' : ''}…`)
    runTempImageUploads(tokenByUri)
    return true
  }, [runTempImageUploads])

  /* ── Auto-migrate legacy embedded images when new content is loaded ── */
  const migratedRef = useRef('')
  useEffect(() => {
    const el = editorRef.current
    if (!el || !value || value === migratedRef.current) return
    if (hasUnmigratedTempImages(value)) {
      migratedRef.current = value
      migrateLoadedContent(el, value)
    }
  }, [value, migrateLoadedContent])

  const handleDragOver = useCallback((e) => {
    if ([...(e.dataTransfer?.types || [])].includes('Files')) e.preventDefault()
  }, [])

  return (
    <div className="rte">
      <div className="rte-toolbar">
        {/* ── Block format (Normal text / Headings) ── */}
        <EditorSelect
          editorRef={editorRef}
          value={activeBlock}
          onChange={formatBlock}
          title="Text style"
          options={[
            { value: 'p', label: 'Normal text' },
            { value: 'h1', label: 'Heading 1' },
            { value: 'h2', label: 'Heading 2' },
            { value: 'h3', label: 'Heading 3' },
            { value: 'h4', label: 'Heading 4' },
            { value: 'h5', label: 'Heading 5' },
            { value: 'h6', label: 'Heading 6' },
            { value: 'blockquote', label: 'Quote' },
          ]}
        />

        {/* ── Font family ── */}
        <EditorSelect
          editorRef={editorRef}
          value={activeFont}
          onChange={setFont}
          title="Font family"
          className="rte-toolbar__select--font"
          options={[
            { value: 'Arial', label: 'Arial' },
            { value: 'Arial Black', label: 'Arial Black' },
            { value: 'Times New Roman', label: 'Times New Roman' },
            { value: 'Courier New', label: 'Courier New' },
            { value: 'Verdana', label: 'Verdana' },
            { value: 'Georgia', label: 'Georgia' },
            { value: 'Trebuchet MS', label: 'Trebuchet MS' },
            { value: 'Comic Sans MS', label: 'Comic Sans MS' },
            { value: 'Impact', label: 'Impact' },
            { value: 'Lucida Console', label: 'Lucida Console' },
            { value: 'Tahoma', label: 'Tahoma' },
            { value: 'Palatino Linotype', label: 'Palatino' },
            { value: 'Segoe UI', label: 'Segoe UI' },
          ]}
        />

        <Sep />

        {/* ── Font size: - [size] + ── */}
        <div className="rte-toolbar__fontsize">
          <button type="button" className="rte-toolbar__fontsize-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => changeFontSize(-1)} title="Decrease font size">−</button>
          <span className="rte-toolbar__fontsize-val">{fontSize}</span>
          <button type="button" className="rte-toolbar__fontsize-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => changeFontSize(1)} title="Increase font size">+</button>
        </div>

        <Sep />

        {/* ── Bold / Italic / Underline / Strikethrough ── */}
        <ToolbarBtn active={bold} onClick={() => doCmd('bold')} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn active={italic} onClick={() => doCmd('italic')} title="Italic (Ctrl+I)">
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn active={underline} onClick={() => doCmd('underline')} title="Underline (Ctrl+U)">
          <span style={{ textDecoration: 'underline' }}>U</span>
        </ToolbarBtn>
        <ToolbarBtn active={strike} onClick={() => doCmd('strikeThrough')} title="Strikethrough">
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </ToolbarBtn>

        <Sep />

        {/* ── Text color ── */}
        <ColorButton
          color={textColor}
          onChange={applyTextColor}
          title="Text color"
          icon={
            <span style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1 }}>A</span>
          }
        />

        {/* ── Highlight color ── */}
        <ColorButton
          color={highlightColor}
          onChange={applyHighlight}
          title="Highlight color"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          }
        />

        <Sep />

        {/* ── Link ── */}
        <ToolbarBtn onClick={addLink} title="Insert link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </ToolbarBtn>

        {/* ── Image ── */}
        <ToolbarBtn onClick={() => fileRef.current?.click()} title="Insert image">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </ToolbarBtn>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />

        {/* ── Clear formatting ── */}
        <ToolbarBtn onClick={() => doCmd('removeFormat')} title="Clear formatting">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3H7l5 5" /><path d="M7 21h10" /><path d="M9.5 13.5L14 18" /><path d="M14 13.5L9.5 18" />
          </svg>
        </ToolbarBtn>

        <Sep />

        {/* ── Alignment ── */}
        <EditorSelect
          editorRef={editorRef}
          value={activeAlign}
          onChange={(val) => doAlign(val)}
          title="Text alignment"
          options={[
            { value: 'left', label: '⫷ Left' },
            { value: 'center', label: '☰ Center' },
            { value: 'right', label: '⫸ Right' },
            { value: 'justify', label: '☰ Justify' },
          ]}
        />

        <Sep />

        {/* ── Indent / Outdent ── */}
        <ToolbarBtn onClick={doIndent} title="Increase indent">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            <polyline points="3 10 7 12 3 14" />
          </svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={doOutdent} title="Decrease indent">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            <polyline points="7 10 3 12 7 14" />
          </svg>
        </ToolbarBtn>

        <Sep />

        {/* ── Ordered list / Unordered list / Task list ── */}
        <ToolbarBtn active={ol} onClick={() => doCmd('insertOrderedList')} title="Numbered list">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
            <text x="2" y="8" fontSize="8" fill="currentColor" stroke="none" fontFamily="sans-serif">1</text>
            <text x="2" y="14" fontSize="8" fill="currentColor" stroke="none" fontFamily="sans-serif">2</text>
            <text x="2" y="20" fontSize="8" fill="currentColor" stroke="none" fontFamily="sans-serif">3</text>
          </svg>
        </ToolbarBtn>
        <ToolbarBtn active={ul} onClick={() => doCmd('insertUnorderedList')} title="Bullet list">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="9" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="9" y1="18" x2="21" y2="18" />
            <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </ToolbarBtn>
        <ToolbarBtn active={taskList} onClick={toggleTaskList} title="Task list">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="6" height="6" rx="1" />
            <path d="M5 7l1.5 1.5L9 5" strokeWidth="1.5" />
            <line x1="13" y1="6" x2="21" y2="6" />
            <rect x="3" y="14" width="6" height="6" rx="1" />
            <line x1="13" y1="17" x2="21" y2="17" />
          </svg>
        </ToolbarBtn>
      </div>

      {/* ── Editor area ── */}
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
        onKeyDown={(e) => {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0) {
              const range = sel.getRangeAt(0)
              let node = range.startContainer
              if (node.nodeType === 3) node = node.parentElement
              if (node?.tagName === 'IMG') {
                setTimeout(() => emitChange(), 50)
              }
            }
          }
        }}
        onKeyUp={(e) => {
          refreshToolbar()
          if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Enter') {
            setTimeout(() => emitChange(), 10)
          }
        }}
        onMouseUp={refreshToolbar}
        onBlur={refreshToolbar}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ minHeight: 250, padding: '1rem', outline: 'none', fontSize: '14px', lineHeight: 1.7 }}
      />

      {pasteStatus && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.85rem',
            color: '#047857',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 8,
          }}
        >
          <span className="btn-save-spinner" />
          {pasteStatus}
        </div>
      )}
    </div>
  )
}
