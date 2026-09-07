import { NextResponse } from 'next/server'
import { uploadImageBuffer, deleteCloudinaryImage } from '@/lib/cloudinary'

const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload a valid image.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    /* Upload the image to Cloudinary and return the URL + public ID.
       The image file itself is never stored in MongoDB or on the server. */
    const buffer = Buffer.from(await file.arrayBuffer())
    const { url, publicId } = await uploadImageBuffer(buffer)

    return NextResponse.json({ url, publicId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const publicId = body?.publicId
    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json({ error: 'No public ID provided' }, { status: 400 })
    }
    await deleteCloudinaryImage(publicId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}