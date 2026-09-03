'use client'

import RichTextEditor from '@/components/admin/RichTextEditor'

export default function FaqBuilder({ value = [], onChange }) {
  const faqs = Array.isArray(value) ? value : []

  const addFaq = () => {
    onChange([...faqs, { question: '', answer: '' }])
  }

  const removeFaq = (index) => {
    onChange(faqs.filter((_, i) => i !== index))
  }

  const updateFaq = (index, field, newValue) => {
    const next = faqs.map((faq, i) =>
      i === index ? { ...faq, [field]: newValue } : faq
    )
    onChange(next)
  }

  return (
    <div className="faq-builder">
      {faqs.map((faq, i) => (
        <div key={i} className="faq-builder__card">
          <div className="faq-builder__card-header">
            <span className="faq-builder__label">FAQ {i + 1}</span>
            <button
              type="button"
              className="itinerary-btn itinerary-btn--danger itinerary-btn--sm"
              onClick={() => removeFaq(i)}
            >
              Remove
            </button>
          </div>
          <div className="faq-builder__fields">
            <div className="form-group">
              <label>Question</label>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => updateFaq(i, 'question', e.target.value)}
                placeholder="e.g. What is included in the tour price?"
              />
            </div>
            <div className="form-group">
              <label>Answer</label>
              <RichTextEditor
                value={faq.answer}
                onChange={(html) => updateFaq(i, 'answer', html)}
                placeholder="Write the answer here..."
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="itinerary-btn itinerary-btn--add"
        onClick={addFaq}
      >
        + Add FAQ
      </button>
    </div>
  )
}
