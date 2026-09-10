import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { socialMediaSchema, formatZodError } from '@/lib/validations'

export async function GET() {
  const record = await prisma.socialMedia.findFirst()
  return NextResponse.json({
    facebookUrl: record?.facebookUrl ?? '',
    instagramUrl: record?.instagramUrl ?? '',
    youtubeUrl: record?.youtubeUrl ?? '',
    tiktokUrl: record?.tiktokUrl ?? '',
  })
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const data = socialMediaSchema.parse(body)
    const existing = await prisma.socialMedia.findFirst()
    if (!existing) {
      await prisma.socialMedia.create({ data })
    } else {
      await prisma.socialMedia.update({
        where: { id: existing.id },
        data,
      })
    }
    revalidatePath('/')
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = formatZodError(error, 'Failed to update social media URLs')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
