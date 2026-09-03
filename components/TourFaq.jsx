'use client'

import { useState } from 'react'

export default function TourFaq({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  if (faqs.length === 0) return null

  return (
    <section className="section tour-faq-section">
      <div className="container">
        <div className="tour-faq">
          {faqs.map((faq, i) => (
            <div key={i} className={`tour-faq__item ${openIndex === i ? 'tour-faq__item--open' : ''}`}>
              <button
                type="button"
                className="tour-faq__question"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
              >
                <span className="tour-faq__question-text">{faq.question}</span>
                <span className="tour-faq__icon">{openIndex === i ? '−' : '+'}</span>
              </button>
              <div className="tour-faq__answer-wrap">
                <div className="tour-faq__answer">
                  <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
