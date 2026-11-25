/**
 * Site-wide FAQ content.
 *
 * Lives outside the client component so the /faqs page can emit matching
 * FAQPage structured data on the server while FaqClient keeps its interactive
 * search, category filter and accordion behaviour.
 *
 * Google requires the visible page content and the markup to match exactly,
 * which is why both render from this single source.
 */

export const FAQ_DATA = [
  // 1. Booking & Payments
  {
    id: 'book-1',
    category: 'Booking & Payments',
    question: 'How do I book a tour with Pehchaan Travels?',
    answer: `Booking with us is quick and simple! You can browse our tours on the <a href="/tours">Tours page</a>, select your preferred trip, and click <strong>"Book Now"</strong> or add it to your cart. Fill in your travel details, passenger count, and preferred departure city. You can also book directly by reaching out to our team on <a href="https://wa.me/923264828913?text=Hi%20Pehchaan%20Travels%2C%20I%27d%20like%20to%20book%20a%20tour." target="_blank" rel="noopener noreferrer">WhatsApp</a> or via our <a href="/contact">Contact Page</a>.`,
  },
  {
    id: 'book-2',
    category: 'Booking & Payments',
    question: 'What is the advance deposit required to confirm my booking?',
    answer: `To reserve your seats and secure hotel accommodations, a <strong>40% advance payment</strong> is required at the time of booking. The remaining <strong>60% balance</strong> is payable prior to departure or on the departure day at the gathering point.`,
  },
  {
    id: 'book-3',
    category: 'Booking & Payments',
    question: 'What payment methods do you accept?',
    answer: `We accept multiple convenient payment channels:
      <ul>
        <li>Direct Online Bank Transfer / IBFT (all major Pakistani banks)</li>
        <li>Raast Instant Payments</li>
        <li>JazzCash & EasyPaisa mobile wallets</li>
        <li>Cash deposit at our office or designated collection accounts</li>
      </ul>
      Official account details and payment instructions are shared at checkout and sent via email and WhatsApp.`,
  },
  {
    id: 'book-4',
    category: 'Booking & Payments',
    question: 'How do I receive my booking voucher and confirmation?',
    answer: `As soon as your advance deposit is verified by our accounts department, you will receive an official booking confirmation email containing your booking ID, itemized voucher, trip itinerary, meeting location, departure schedule, and contact details for your tour manager.`,
  },

  // 2. Tours & Travel Packages
  {
    id: 'tour-1',
    category: 'Tours & Packages',
    question: 'What is typically included in your tour packages?',
    answer: `Our tour packages are carefully curated for maximum comfort and peace of mind. Standard packages include:
      <ul>
        <li>Air-conditioned luxury transport throughout the journey (Saloon Coaster or Grand Cabin)</li>
        <li>Off-road 4x4 Prado / Jeep transport for rugged trails (e.g. Deosai Plains, Siri Paye, Saif-ul-Malook)</li>
        <li>Hotel accommodations (standard sharing or private couple rooms as booked)</li>
        <li>Daily hygienic breakfasts and dinners (as specified in each itinerary)</li>
        <li>Experienced mountain drivers and professional tour managers</li>
        <li>All highway tolls, taxes, and fuel expenses</li>
        <li>Bonfire and musical night arrangements (weather permitting)</li>
      </ul>`,
  },
  {
    id: 'tour-2',
    category: 'Tours & Packages',
    question: 'What is excluded from the tour packages?',
    answer: `Unless specifically requested for private customized packages, standard packages do not cover:
      <ul>
        <li>Personal lunches, beverages, snacks, laundry, and room service</li>
        <li>Entry tickets to historical forts (e.g. Baltit, Altit, Shigar), national park permits, or museums</li>
        <li>Optional adventure activities (river rafting, chairlifts, boating, horse riding, zip-line)</li>
        <li>Personal clothing, trekking gear, and porter charges</li>
        <li>Emergency medical aid, helicopter rescue, or personal travel insurance</li>
      </ul>`,
  },
  {
    id: 'tour-3',
    category: 'Tours & Packages',
    question: 'Where are the departure and pickup points located?',
    answer: `Our public group tours regularly depart from:
      <ul>
        <li><strong>Lahore:</strong> Thokar Niaz Baig Flyover, near Daewoo Express Terminal (usually 10:00 PM – 11:00 PM)</li>
        <li><strong>Islamabad / Rawalpindi:</strong> Motorway Toll Plaza or Faizabad Interchange (around 03:30 AM – 04:30 AM)</li>
      </ul>
      For private customized tours, door-to-door pickups from any residence, hotel, or airport in Pakistan can be arranged.`,
  },
  {
    id: 'tour-4',
    category: 'Tours & Packages',
    question: 'Are your tours suitable for families, women, and children?',
    answer: `Yes, 100%! Pehchaan Travels takes immense pride in providing a secure, respectful, and family-friendly environment. A large portion of our guests are families, married couples, solo female travelers, and senior citizens. We enforce strict behavioral guidelines on all trips and carefully select family-safe hotels and rest stops.`,
  },

  // 3. Custom Trips & Groups
  {
    id: 'custom-1',
    category: 'Custom Trips & Groups',
    question: 'Can I design my own customized itinerary for my family or private group?',
    answer: `Yes, absolutely! With our <a href="/make-my-trip">Make My Trip</a> feature, you can customize every detail of your journey — including your choice of destinations (Hunza, Skardu, Swat, Kumrat, Kashmir, Fairy Meadows), travel dates, vehicle preference (Prado, Land Cruiser, Hiace, Coaster), hotel tiers (3-star, 4-star, or luxury resorts), and meal plans. Our trip specialists will design a custom itinerary with an exact quote within 24 hours.`,
  },
  {
    id: 'custom-2',
    category: 'Custom Trips & Groups',
    question: 'Do you arrange corporate tours, university trips, and honeymoons?',
    answer: `Yes! We organize specialized group tours tailored for corporate team retreats, university and college delegations, photography expeditions, and luxury honeymoon packages with private executive transport, decorated suites, and candlelight dinners. Contact us for custom corporate packages.`,
  },
  {
    id: 'custom-3',
    category: 'Custom Trips & Groups',
    question: 'Do you offer group discounts for large families or groups?',
    answer: `Yes, we offer special discounted rates for groups of 6 or more persons, as well as complimentary slots for large groups (e.g. 1 free slot for every 15 paying guests on private tours). Inquire through our <a href="/contact">contact form</a> or WhatsApp for group quotation details.`,
  },

  // 4. Hotels & Accommodations
  {
    id: 'hotel-1',
    category: 'Hotels & Stays',
    question: 'What quality of hotels and resorts do you provide?',
    answer: `We only partner with vetted, reputable hotels and resorts across Northern Pakistan (such as Serena Hotels, Shangrila Resort, Pearl Continental, Eagle's Nest, and top-tier local boutique hotels). We ensure that every room has comfortable bedding, clean private bathrooms with 24/7 hot water supply, reliable power backup, and breathtaking views. You can also view our hotel partners on the <a href="/hotels">Hotels page</a>.`,
  },
  {
    id: 'hotel-2',
    category: 'Hotels & Stays',
    question: 'Can married couples or private groups get separate private rooms?',
    answer: `Yes. While standard packages are based on 3 to 4 persons sharing per room (with beds and quality mattresses), married couples and private groups can select the <strong>Couple Room / Private Room</strong> option during booking for an additional fee to enjoy complete privacy.`,
  },
  {
    id: 'hotel-3',
    category: 'Hotels & Stays',
    question: 'What are the check-in and check-out times at the hotels?',
    answer: `Standard hotel check-in time across Northern Pakistan is typically 2:00 PM, and check-out is by 12:00 PM (noon). Early check-in or late check-out is subject to hotel room availability, though our tour schedules are planned to align smoothly with hotel transfer timings.`,
  },

  // 5. Cancellations & Refunds
  {
    id: 'cancel-1',
    category: 'Cancellations & Refunds',
    question: 'What is your cancellation and refund policy?',
    answer: `Our cancellation policy is straightforward and transparent:
      <ul>
        <li><strong>7 or more days</strong> before departure: 30% deduction from advance deposit.</li>
        <li><strong>3 to 6 days</strong> before departure: 40% deduction from advance deposit.</li>
        <li><strong>2 days (48 hours)</strong> before departure: 60% deduction from advance deposit.</li>
        <li><strong>Within 24 hours or on departure day:</strong> No refund is applicable due to pre-booked vehicle seats and reserved hotel rooms.</li>
      </ul>
      For complete details, please review our <a href="/terms">Terms of Service</a>.`,
  },
  {
    id: 'cancel-2',
    category: 'Cancellations & Refunds',
    question: 'How long does it take to process an approved refund?',
    answer: `All eligible refunds are processed and transferred directly to your designated bank account, Raast ID, or mobile wallet within <strong>3 business days</strong> from the date of official cancellation approval.`,
  },
  {
    id: 'cancel-3',
    category: 'Cancellations & Refunds',
    question: 'What happens if a trip is delayed or cancelled due to bad weather or roadblocks?',
    answer: `Guest safety is our highest priority. In case of unexpected natural events (landslides, severe snow, or road closures on the Karakoram Highway / Babusar Pass), our experienced tour leaders will coordinate alternative safe routes, scenic detours, or adjusted hotel stops. If a tour cannot depart due to force majeure, you will receive full trip credit towards a rescheduled date.`,
  },

  // 6. Safety & Guidelines
  {
    id: 'safety-1',
    category: 'Safety & Guidelines',
    question: 'Is it safe to travel to Northern Pakistan and Gilgit-Baltistan?',
    answer: `Yes, Northern Pakistan is recognized as one of the safest, most peaceful, and hospitable travel regions in the world. Local communities in Hunza, Skardu, Kaghan, and Swat warmly welcome tourists. Pehchaan Travels maintains round-the-clock route monitoring, vetted mountain drivers, and high-clearance vehicles to guarantee safe travel.`,
  },
  {
    id: 'safety-2',
    category: 'Safety & Guidelines',
    question: 'What essential items should I pack for a Northern Pakistan tour?',
    answer: `We recommend packing the following essentials:
      <ul>
        <li>Original CNIC or valid Passport (mandatory for security checkpoints)</li>
        <li>Comfortable walking or trekking shoes with good grip</li>
        <li>Warm layers (fleece jacket, thermal inner, shawl or hoodie — mountain evenings get chilly)</li>
        <li>Rain jacket or umbrella and UV sunglasses</li>
        <li>Sunblock (SPF 50+), lip balm, and moisturizer for dry mountain air</li>
        <li>Personal medicines (motion sickness, pain relief, altitude sickness) and basic first aid</li>
        <li>Power bank and universal charging cables</li>
      </ul>`,
  },
  {
    id: 'safety-3',
    category: 'Safety & Guidelines',
    question: 'Are first aid and emergency assistance available during the trip?',
    answer: `Yes. Every Pehchaan Travels vehicle is equipped with a basic first aid medical kit, and our tour managers are trained in initial emergency handling. In the rare event of severe medical need, local district headquarters hospitals and armed forces medical facilities across Northern Pakistan are readily accessible.`,
  },
]

export const FAQ_CATEGORIES = [
  'All',
  'Booking & Payments',
  'Tours & Packages',
  'Custom Trips & Groups',
  'Hotels & Stays',
  'Cancellations & Refunds',
  'Safety & Guidelines',
]
