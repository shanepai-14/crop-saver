import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Crop Saver Philippines Corporation",
  "alternateName": "CSPC",
  "description": "Trusted supplier of agrochemicals, crop protection products, fertilizers, and manpower services for Filipino farmers since 2018.",
  "url": "https://www.cropsaverphilippinescorporation.com",
  "telephone": "+63691918908",
  "email": "cropsaverphil@gmail.com",
  "foundingDate": "2018-08-08",
  "slogan": "The Farmer's Partner",
  "address": [
    {
      "@type": "PostalAddress",
      "streetAddress": "Parenas St. Km. 08, Carlos Garcia Highway, Brgy. Cabantian",
      "addressLocality": "Davao City",
      "addressRegion": "Davao del Sur",
      "addressCountry": "PH"
    }
  ],
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    "opens": "09:00",
    "closes": "18:00"
  }
}

const stats = [
  { value: '5,000+', label: 'Satisfied Farmers' },
  { value: '3,000+', label: 'Jobs Provided' },
  { value: '200+', label: 'Business Clients' },
  { value: '7+', label: 'Years of Service' },
]

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Certified Quality',
    description: 'All products are rigorously tested and certified, ensuring safety and efficacy for your crops and soil.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Expert Consultation',
    description: 'Our agronomists provide crop-specific advice to maximize yield and minimize losses from pests and disease.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Workforce Solutions',
    description: 'From skilled laborers to professional workers, we match the right talent to your agricultural operation.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Nationwide Reach',
    description: 'With offices in Davao City and Bulacan, we serve farmers across Mindanao, Visayas, and Luzon.',
  },
]

const process = [
  { step: '01', title: 'Understand Your Needs', desc: "We listen first — every farm is unique and we tailor solutions to your crops and conditions." },
  { step: '02', title: 'Expert Consultation', desc: "Our agronomists assess your situation and recommend the right products and approach." },
  { step: '03', title: 'Quality Products', desc: "Access our full range of certified agrochemicals, fertilizers, and crop protection solutions." },
  { step: '04', title: 'Training Programs', desc: "We train your team on proper application techniques for maximum safety and effectiveness." },
  { step: '05', title: 'Sustainable Growth', desc: "Ongoing support to ensure your soil health and yields improve season after season." },
  { step: '06', title: 'Market Connections', desc: "We connect you to buyers and networks that help you grow your business beyond the farm." },
]

const crops = ['Bananas', 'Pineapples', 'Vegetables', 'Rice', 'Corn', 'Coconut', 'Sugarcane']

const testimonials = [
  {
    name: 'Rodrigo Manalo',
    role: 'Banana Plantation Owner',
    location: 'Davao del Sur',
    avatar: 'RM',
    rating: 5,
    text: "Crop Saver's foliar fertilizer transformed our banana harvest. We saw a visible difference in leaf color and fruit size within two weeks of application. Their agronomist visited our farm personally and gave us a schedule that doubled our yield this season.",
    crop: '🍌 Banana',
  },
  {
    name: 'Ma. Luisa Santos',
    role: 'Vegetable Farmer',
    location: 'Bukidnon',
    avatar: 'ML',
    rating: 5,
    text: "I've been using their herbicide and insecticide program for three cropping seasons now. The weeds are under control, our leafy vegetables are healthier, and the price is fair compared to other suppliers. The delivery is always on time too.",
    crop: '🥬 Vegetables',
  },
  {
    name: 'Arnel Corpuz',
    role: 'Rice Farm Manager',
    location: 'Bulacan',
    avatar: 'AC',
    rating: 5,
    text: "Being in Luzon, I was skeptical about working with a Davao-based company. But Crop Saver opened their Bulacan office and it's been seamless. Their NPK fertilizer increased our palay yield by about 20% this wet season. Highly recommended.",
    crop: '🌾 Rice',
  },
  {
    name: 'Jennifer Reyes',
    role: 'Agri-Business Owner',
    location: 'Davao City',
    avatar: 'JR',
    rating: 5,
    text: "We supply fresh produce to supermarkets and rely on Crop Saver for consistent product quality and timely delivery. Their team is responsive — whenever I have a crop problem, I just call and they send someone to assess within the day.",
    crop: '🌽 Corn & Vegetables',
  },
  {
    name: 'Ramon dela Cruz',
    role: 'Pineapple Grower',
    location: 'South Cotabato',
    avatar: 'RD',
    rating: 5,
    text: "The soil conditioner they recommended fixed our soil pH issue that had been affecting our pineapple quality for years. The team took soil samples, gave a full analysis, and now our fruits are consistently sweeter and larger. True experts.",
    crop: '🍍 Pineapple',
  },
]

const partners = [
  { name: 'DA – Dept. of Agriculture', abbr: 'DA' },
  { name: 'PhilRice', abbr: 'PhilRice' },
  { name: 'DOLE Philippines', abbr: 'DOLE' },
  { name: 'DTI Philippines', abbr: 'DTI' },
  { name: 'Unifrutti Philippines', abbr: 'Unifrutti' },
  { name: 'TESDA', abbr: 'TESDA' },
]

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-gold-500' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <>
      <SEOHead
        description="Crop Saver Philippines Corporation – trusted supplier of agrochemicals, crop protection products, and fertilizers for Filipino farmers. 5,000+ satisfied clients since 2018. Serving Davao, Bulacan, and nationwide."
        canonical="/"
        jsonLd={businessJsonLd}
      />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center text-white overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
            alt="Filipino farmer working in lush green rice fields"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950/90 via-brand-900/75 to-brand-800/50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-700/50 border border-brand-600 text-brand-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
                Est. 2018 · Davao City, Philippines
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance mb-6">
                Science-Backed Solutions for{' '}
                <span className="text-gold-400">Filipino Farmers</span>
              </h1>
              <p className="text-brand-100 text-lg leading-relaxed mb-8 max-w-xl">
                From crop protection to soil enhancement — we empower farmers across the Philippines with premium agrochemicals, expert consultation, and reliable workforce solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-brand-950 font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Get a Free Consultation
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  to="/agrochemicals"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all"
                >
                  View Our Products
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-4 text-sm text-brand-300">
                <div className="flex items-center">
                  {['RM','ML','AC','JR'].map((initials, i) => (
                    <div
                      key={initials}
                      style={{ marginLeft: i === 0 ? 0 : '-8px', zIndex: 10 - i }}
                      className="w-8 h-8 rounded-full bg-brand-700 border-2 border-brand-900 flex items-center justify-center text-white text-xs font-bold relative"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <span>Trusted by <strong className="text-white">5,000+</strong> farmers nationwide</span>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ value, label }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-colors">
                  <div className="text-3xl sm:text-4xl font-display font-bold text-gold-400 mb-1">{value}</div>
                  <div className="text-sm text-brand-200">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full text-white fill-current" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"/>
          </svg>
        </div>
      </section>

      {/* Crop tags */}
      <section className="bg-white py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-500 mr-2">Crops we support:</span>
            {crops.map(crop => (
              <span key={crop} className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1 rounded-full border border-brand-100">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                {crop}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-widest">Why Choose Us</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-gray-900">
              Your Complete Agricultural Partner
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              We go beyond supplying products — we provide the knowledge, support, and workforce to help your farm thrive from start to harvest.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon, title, description }) => (
              <div key={title} className="group p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50 transition-all">
                <div className="w-12 h-12 bg-brand-50 text-brand-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-700 group-hover:text-white transition-colors">
                  {icon}
                </div>
                <h3 className="font-display font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Split with images */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Agrochemicals Card */}
            <div className="relative rounded-3xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=75"
                alt="Agrochemical products and crop protection"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-900/80 to-brand-800/40" />
              <div className="relative p-8 sm:p-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-3">Agrochemicals</h2>
                <p className="text-brand-200 mb-6 leading-relaxed">
                  Premium foliar fertilizers, herbicides, insecticides, and fungicides formulated for Philippine crops. Protect your investment and maximize yields.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-brand-100">
                  {['Foliar Fertilizers', 'Herbicides & Pesticides', 'Soil Conditioners', 'Crop Protection'].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/agrochemicals" className="inline-flex items-center gap-2 bg-white text-brand-800 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors">
                  Explore Products
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Manpower Card */}
            <div className="relative rounded-3xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=75"
                alt="Agricultural workforce and manpower services"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-900/80 to-gray-800/40" />
              <div className="relative p-8 sm:p-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-3">Manpower Services</h2>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Skilled, vetted, and job-ready workers for your agricultural and industrial operations. From temporary labor to permanent placements.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-gray-300">
                  {['Skilled & Unskilled Workers', 'Temporary & Permanent Placements', 'Professional Staffing', 'Contractual Workforce'].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/manpower" className="inline-flex items-center gap-2 bg-white text-gray-800 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-widest">How We Work</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-gray-900">
              Our 6-Step Support Process
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              From initial inquiry to sustainable harvest — we walk with you at every stage of your agricultural journey.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map(({ step, title, desc }) => (
              <div key={step} className="relative p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-50 text-brand-700 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0 group-hover:bg-brand-700 group-hover:text-white transition-colors">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-widest">Client Stories</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-gray-900">
              What Our Partners Say About Us
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Over 5,000 farmers and businesses across the Philippines trust Crop Saver. Here's what some of them have to say.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, location, avatar, rating, text, crop }) => (
              <div key={name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-100 transition-all flex flex-col">
                {/* Quote icon */}
                <svg className="w-8 h-8 text-brand-200 mb-3" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H6c0-2.2 1.8-4 4-4V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-8c0-2.2 1.8-4 4-4V8z"/>
                </svg>

                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">"{text}"</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=166534&color=fff&size=40&bold=true`}
                      alt={name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{name}</div>
                      <div className="text-xs text-gray-400">{role} · {location}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <StarRating rating={rating} />
                    <span className="text-xs text-brand-600 font-medium mt-0.5 block">{crop}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall rating strip */}
          <div className="mt-10 bg-brand-700 rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <div className="text-5xl font-display font-bold text-gold-400">5.0</div>
              <div>
                <StarRating rating={5} />
                <div className="text-brand-200 text-sm mt-1">Average rating from 5,000+ clients</div>
              </div>
            </div>
            <Link
              to="/contact"
              className="shrink-0 bg-white text-brand-800 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors text-sm"
            >
              Become Our Next Success Story
            </Link>
          </div>
        </div>
      </section>

      {/* ── PARTNERS / AFFILIATIONS ── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-10">
            Trusted & Affiliated With
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {partners.map(({ name, abbr }) => (
              <div
                key={name}
                title={name}
                className="flex items-center justify-center h-16 px-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-brand-200 hover:bg-brand-50 transition-all group"
              >
                <span className="text-sm font-bold text-gray-400 group-hover:text-brand-700 transition-colors text-center leading-tight">
                  {abbr}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-800 to-brand-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Ready to Protect and Grow Your Crops?
          </h2>
          <p className="text-brand-200 text-lg mb-8 max-w-2xl mx-auto">
            Talk to one of our agronomists today. Get personalized product recommendations and a free consultation for your farm.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-brand-950 font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Request a Free Consultation
            </Link>
            <a
              href="tel:+63691918908"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Us Now
            </a>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the science leader by empowering people to improve their lives and provide the best solutions from Start–Grow–Finish stages at reasonably lower prices.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-gold-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                Unleashing the Power of PLANTS through innovation and knowledge — providing Filipino farmers with the tools, science, and support they need to feed a nation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Internal HR System link */}
      <div className="bg-brand-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/50 text-xs">Internal access only</p>
          <Link
            to="/login"
            className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            HR &amp; Payroll System
          </Link>
        </div>
      </div>
    </>
  )
}
