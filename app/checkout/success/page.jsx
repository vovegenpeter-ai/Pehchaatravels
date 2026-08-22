import Link from 'next/link'

export const metadata = {
  title: 'Booking Confirmed — Pehchaan Travels',
}

async function getOrder(orderId) {
  if (!orderId) return null
  try {
    const { prisma } = await import('@/lib/prisma')
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    return order
  } catch {
    return null
  }
}

export default async function CheckoutSuccessPage({ searchParams }) {
  const params = await searchParams
  const orderId = params?.orderId
  const order = orderId ? await getOrder(orderId) : null

  return (
    <section className="checkout-section">
      <div className="container">
        <div className="checkout-success">
          <div className="checkout-success__icon">✅</div>
          <h1>Booking Confirmed!</h1>
          <p>
            Thank you for booking with Pehchaan Travels. We&apos;ve received your
            booking and our team will contact you shortly to confirm the details.
          </p>

          {order && (
            <div className="checkout-success__details" style={{
              background: '#f7fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              margin: '24px 0',
              textAlign: 'left',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              <h3 style={{ margin: '0 0 16px', textAlign: 'center', color: '#1a4d3e' }}>📋 Booking Details</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#718096', width: '140px' }}>Reference ID</td>
                    <td style={{ padding: '6px 0', fontWeight: 700, color: '#1a4d3e', fontFamily: 'monospace' }}>{order.id}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#718096' }}>Name</td>
                    <td style={{ padding: '6px 0', color: '#2d3748' }}>{order.fullName}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#718096' }}>Email</td>
                    <td style={{ padding: '6px 0', color: '#2d3748' }}>{order.email}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#718096' }}>Phone</td>
                    <td style={{ padding: '6px 0', color: '#2d3748' }}>{order.phone}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#718096' }}>Tours</td>
                    <td style={{ padding: '6px 0', color: '#2d3748' }}>
                      {order.items.map((item) => (
                        <div key={item.id} style={{ marginBottom: '4px' }}>
                          {item.tourName} × {item.quantity}
                        </div>
                      ))}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#718096' }}>Status</td>
                    <td style={{ padding: '6px 0' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                      }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ padding: '8px 0' }}><hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: 0 }} /></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', fontSize: '16px', fontWeight: 700, color: '#1e3a5f' }}>Total Amount</td>
                    <td style={{ padding: '6px 0', fontSize: '16px', fontWeight: 700, color: '#1a4d3e' }}>PKR {Number(order.totalAmount).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="checkout-success__info">
            <p>📧 A confirmation email has been sent to your email address.</p>
            <p>📞 Our team will call you within 24 hours to finalize your trip.</p>
            {order && (
              <p style={{ fontSize: '13px', color: '#718096', marginTop: '12px' }}>
                💡 Save your Reference ID: <strong style={{ color: '#1a4d3e', fontFamily: 'monospace' }}>{order.id}</strong>
              </p>
            )}
          </div>
          <div className="checkout-success__actions">
            <Link href="/tours" className="btn btn--primary btn--lg">
              Explore More Tours
            </Link>
            <Link href="/" className="btn btn--outline btn--lg">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
