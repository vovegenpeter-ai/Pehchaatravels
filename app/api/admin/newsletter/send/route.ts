import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewsletterEmail } from '@/lib/mail'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { newsletterId } = body

    if (!newsletterId) {
      return NextResponse.json({ error: 'Newsletter ID is required' }, { status: 400 })
    }

    // Get the newsletter
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
    })

    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
    }

    if (newsletter.status === 'sent') {
      return NextResponse.json({ error: 'Newsletter has already been sent' }, { status: 400 })
    }

    // Update status to sending
    await prisma.newsletter.update({
      where: { id: newsletterId },
      data: { status: 'sending' },
    })

    // Get all active subscribers
    const activeSubscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: 'active' },
    })

    if (activeSubscribers.length === 0) {
      await prisma.newsletter.update({
        where: { id: newsletterId },
        data: { status: 'failed', recipientCount: 0 },
      })
      return NextResponse.json({ error: 'No active subscribers found' }, { status: 400 })
    }

    // Send emails to all active subscribers
    let successCount = 0
    let failCount = 0

    for (const subscriber of activeSubscribers) {
      try {
        const result = await sendNewsletterEmail({
          to: subscriber.email,
          subject: newsletter.subject,
          title: newsletter.title,
          content: newsletter.content,
          image: newsletter.image || undefined,
          ctaText: newsletter.ctaText || undefined,
          ctaUrl: newsletter.ctaUrl || undefined,
          unsubscribeEmail: subscriber.email,
        })

        if (result.sent) {
          successCount++
        } else {
          failCount++
          console.warn(`[NEWSLETTER] Failed to send to ${subscriber.email}:`, result.reason)
        }
      } catch (error) {
        failCount++
        console.error(`[NEWSLETTER] Error sending to ${subscriber.email}:`, error)
      }
    }

    // Update newsletter status
    const finalStatus = failCount === 0 ? 'sent' : successCount > 0 ? 'sent' : 'failed'
    await prisma.newsletter.update({
      where: { id: newsletterId },
      data: {
        status: finalStatus,
        sentAt: new Date(),
        recipientCount: successCount,
      },
    })

    return NextResponse.json({
      message: `Newsletter sent successfully to ${successCount} subscribers${failCount > 0 ? `. ${failCount} failed.` : '.'}`,
      successCount,
      failCount,
      total: activeSubscribers.length,
    })
  } catch (error) {
    console.error('[ADMIN NEWSLETTER SEND ERROR]', error)
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 })
  }
}
