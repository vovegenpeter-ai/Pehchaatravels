'use client'

import { Editor } from '@tinymce/tinymce-react'
import { useRef, useEffect } from 'react'

export default function RichTextEditor({ value = '', onChange, placeholder = 'Write something...' }) {
  const editorRef = useRef(null)
  const isInternalChange = useRef(false)

  /* Sync editor when value prop changes from outside (e.g. API data loaded) */
  useEffect(() => {
    const ed = editorRef.current
    if (!ed) return
    // Skip if this change came from the editor itself
    if (isInternalChange.current) { isInternalChange.current = false; return }
    // Only update if the content actually differs
    if (ed.getContent() !== value) {
      ed.setContent(value || '')
    }
  }, [value])

  return (
    <div className="rte">
      <Editor
        tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@8/tinymce.min.js"
        onInit={(_evt, ed) => { editorRef.current = ed }}
        onEditorChange={(content) => {
          isInternalChange.current = true
          onChange(content)
        }}
        init={{
          height: 400,
          menubar: false,
          branding: false,
          promotion: false,
          placeholder,
          /* ── Toolbar ── */
          toolbar: [
            'undo redo | blocks fontfamily fontsizeselect | bold italic underline strikethrough | forecolor backcolor | removeformat',
            'alignleft aligncenter alignright alignjustify | bullist numlist | link image | outdent indent | code'
          ],
          toolbar_mode: 'wrap',
          /* ── Font families ── */
          font_family_formats:
            'Default=default;Sans Serif=sans-serif;Serif=serif;Monospace=monospace;Cursive=cursive;Arial=Arial,Helvetica,sans-serif;Times New Roman=Times New Roman,Times,serif;Courier New=Courier New,Courier,monospace;Georgia=Georgia,serif;Verdana=Verdana,Geneva,sans-serif',
          /* ── Font sizes ── */
          font_size_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
          /* ── Heading block formats ── */
          blocks: 'p h1 h2 h3 h4 h5 h6',
          /* ── Content styles (match existing .tiptap styles) ── */
          content_style: `
            body {
              font-family: inherit;
              font-size: 15px;
              line-height: 1.7;
              color: #333;
              padding: 1rem;
              margin: 0;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #2d8a5e;
              margin: 1rem 0 0.5rem;
            }
            p { margin: 0 0 0.75rem; }
            ul, ol { padding-left: 1.5rem; margin: 0.5rem 0; }
            a { color: #2d8a5e; text-decoration: underline; }
            img { max-width: 100%; height: auto; border-radius: 6px; margin: 0.75rem 0; display: block; }
            blockquote {
              border-left: 3px solid #2d8a5e;
              margin: 0.75rem 0;
              padding: 0.5rem 1rem;
              background: #f8fafb;
              font-style: italic;
            }
            code {
              background: #f1f5f9;
              border-radius: 3px;
              padding: 0.15em 0.35em;
              font-size: 0.88em;
            }
            pre {
              background: #1e293b;
              color: #e2e8f0;
              border-radius: 6px;
              padding: 1rem;
              overflow-x: auto;
            }
            pre code { background: none; color: inherit; padding: 0; }
          `,
          /* ── Image: convert to base64 (matches existing approach) ── */
          images_upload_handler: (blobInfo) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result)
              reader.onerror = () => reject('Image upload failed')
              reader.readAsDataURL(blobInfo.blob())
            }),
          /* ── Link ── */
          link_default_target: '_blank',
          link_assume_external_targets: true,
          /* ── Misc ── */
          resize: true,
          autosave_interval: '30s',
          autosave_restore_when_empty: false,
          quickbars_selection_toolbar: 'bold italic | quicklink h2 h3',
          quickbars_insert_toolbar: false,
          contextmenu: false,
          skin: false,
          content_css: false,
        }}
      />
    </div>
  )
}
