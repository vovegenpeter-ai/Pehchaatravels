import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Unsubscribe</title></head>
        <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #dc2626;">Invalid Link</h1>
            <p>This unsubscribe link is invalid or expired.</p>
          </div>
        </body>
        </html>
      `, { status: 400, headers: { 'Content-Type': 'text/html' } })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    })

    if (!subscriber) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Unsubscribe</title></head>
        <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #dc2626;">Email Not Found</h1>
            <p>This email address is not subscribed to our newsletter.</p>
          </div>
        </body>
        </html>
      `, { status: 404, headers: { 'Content-Type': 'text/html' } })
    }

    if (subscriber.status === 'unsubscribed') {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Unsubscribe</title></head>
        <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #16a34a;">Already Unsubscribed</h1>
            <p>You are already unsubscribed from our newsletter.</p>
            <a href="/" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #1a4d3e; color: white; text-decoration: none; border-radius: 8px;">Back to Home</a>
          </div>
        </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } })
    }

    await prisma.newsletterSubscriber.update({
      where: { email: normalizedEmail },
      data: { status: 'unsubscribed', unsubscribedAt: new Date() },
    })

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head><title>Unsubscribe</title></head>
      <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5;">
        <div style="text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #16a34a;">Successfully Unsubscribed</h1>
          <p>You have successfully unsubscribed from our newsletter.</p>
          <p style="color: #6b7280; font-size: 14px;">You will no longer receive newsletter emails from us.</p>
          <a href="/" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #1a4d3e; color: white; text-decoration: none; border-radius: 8px;">Back to Home</a>
        </div>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })
  } catch (error) {
    console.error('[NEWSLETTER UNSUBSCRIBE ERROR]', error)
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head><title>Unsubscribe Error</title></head>
      <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5;">
        <div style="text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #dc2626;">Error</h1>
          <p>Something went wrong. Please try again later.</p>
        </div>
      </body>
      </html>
    `, { status: 500, headers: { 'Content-Type': 'text/html' } })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    })

    if (!subscriber) {
      return NextResponse.json({ error: 'Email not found in our subscriber list.' }, { status: 404 })
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json({ message: 'You are already unsubscribed.' })
    }

    await prisma.newsletterSubscriber.update({
      where: { email: normalizedEmail },
      data: { status: 'unsubscribed', unsubscribedAt: new Date() },
    })

    return NextResponse.json({ message: 'You have successfully unsubscribed from our newsletter.' })
  } catch (error) {
    console.error('[NEWSLETTER UNSUBSCRIBE ERROR]', error)
    return NextResponse.json({ error: 'Failed to unsubscribe. Please try again.' }, { status: 500 })
  }
}
