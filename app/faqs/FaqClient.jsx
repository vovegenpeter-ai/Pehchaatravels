'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PHONE_NUMBER, EMAIL } from '@/lib/initialData'

import { FAQ_DATA, FAQ_CATEGORIES as CATEGORIES } from '@/lib/faq-data'


export default function FaqClient() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [openIds, setOpenIds] = useState(new Set(['book-1', 'tour-1']))

  const toggleItem = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    setOpenIds(new Set(filteredFaqs.map((f) => f.id)))
  }

  const collapseAll = () => {
    setOpenIds(new Set())
  }

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return FAQ_DATA.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'All' || faq.category === selectedCategory
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  return (
    <div className="faqs-container">
      {/* Search & Category Filter Toolbar */}
      <div className="faqs-toolbar">
        {/* Search Input */}
        <div className="faqs-search-wrap">
          <span className="faqs-search-icon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="faqs-search-input"
            placeholder="Search questions (e.g. deposit, Hunza, refund, cancellation, family)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search frequently asked questions"
          />
          {searchQuery && (
            <button
              type="button"
              className="faqs-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="faqs-categories" role="tablist" aria-label="FAQ Categories">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`faqs-category-pill ${isActive ? 'faqs-category-pill--active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Meta Bar: Question count and Expand/Collapse All */}
      <div className="faqs-meta-bar">
        <span>
          Showing <strong>{filteredFaqs.length}</strong> {filteredFaqs.length === 1 ? 'question' : 'questions'}
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        {filteredFaqs.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="faqs-toggle-all-btn" onClick={expandAll}>
              Expand All
            </button>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <button type="button" className="faqs-toggle-all-btn" onClick={collapseAll}>
              Collapse All
            </button>
          </div>
        )}
      </div>

      {/* Accordion Questions List */}
      {filteredFaqs.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            background: '#f8fafc',
            borderRadius: '16px',
            border: '1px dashed #cbd5e1',
          }}
        >
          <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            No matching questions found
          </p>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
            We couldn&apos;t find any FAQs matching your search criteria. Try a different keyword or browse all topics.
          </p>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="tour-faq">
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.has(faq.id)
            return (
              <div
                key={faq.id}
                className={`tour-faq__item ${isOpen ? 'tour-faq__item--open' : ''}`}
              >
                <button
                  type="button"
                  className="tour-faq__question"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                >
                  <span className="tour-faq__icon">{isOpen ? '−' : '+'}</span>
                  <span className="tour-faq__question-text">
                    <span className="faqs-category-tag">{faq.category}</span>
                    {faq.question}
                  </span>
                </button>
                <div className="tour-faq__answer-wrap">
                  <div className="tour-faq__answer">
                    <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Still Have Questions CTA */}
      <div className="faqs-cta-card">
        <h3 className="faqs-cta-title">Still have questions?</h3>
        <p className="faqs-cta-desc">
          Can&apos;t find the answer you&apos;re looking for? Our friendly travel specialists are available 24/7 to guide you through bookings, customized itineraries, and travel advice.
        </p>
        <div className="faqs-cta-actions">
          <Link href="/contact" className="faqs-cta-btn-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Contact Us
          </Link>
          <a
            href={`https://wa.me/${PHONE_NUMBER.replace(/\D/g, '')}?text=Hi%20Pehchaan%20Travels%2C%20I%20have%20a%20question%20regarding%20tours.`}
            target="_blank"
            rel="noopener noreferrer"
            className="faqs-cta-btn-whatsapp"
          >
            <svg viewBox="0 0 32 32" width="18" height="18" fill="#fff">
              <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.054 9.378L1.054 31.2l6.04-1.97A15.91 15.91 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0Zm9.324 22.608c-.39 1.096-1.932 2.008-3.16 2.27-.84.18-1.938.322-5.632-1.21-4.728-1.962-7.766-6.764-7.998-7.076-.224-.312-1.87-2.49-1.87-4.75s1.184-3.368 1.608-3.83c.39-.428.924-.604 1.232-.604.15 0 .286.008.41.014.424.018.636.044.914.71.344.828 1.184 2.886 1.288 3.096.104.21.344.72.116 1.156-.232.436-.464.704-.854 1.14-.39.436-.748.78-1.032 1.174-.264.36-.544.748-.232 1.456.312.708 1.388 2.288 2.978 3.708 2.044 1.824 3.766 2.39 4.344 2.658.578.268.908.224 1.244-.134.336-.356 1.432-1.672 1.814-2.248.376-.576.756-.48 1.276-.288.524.192 3.312 1.56 3.878 1.844.566.284.944.428 1.084.664.14.236.14 1.368-.252 2.464Z" />
            </svg>
            Chat on WhatsApp
          </a>
          <a
            href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}
            className="btn btn--outline-light btn--sm"
            style={{ borderRadius: '8px', minHeight: '44px' }}
          >
            Call {PHONE_NUMBER}
          </a>
        </div>
      </div>
    </div>
  )
}
