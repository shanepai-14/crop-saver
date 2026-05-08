import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'

const WHATSAPP_URL = 'https://wa.me/63691918908?text=Hello%2C%20I%20would%20like%20to%20make%20an%20inquiry.'
const CALENDLY_URL = 'https://calendly.com/cropsaverphil2/30min'
const ORDER_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdv2LV_ZM7CU43vwzmpI6pU-3YMYtPESjWmTPvIk_TJDfFGrw/viewform'

const locations = [
  {
    label: 'Main Office',
    address: 'Parenas St. Km. 08, Carlos Garcia Highway, Brgy. Cabantian, Davao City',
    city: 'Davao City, Philippines',
  },
  {
    label: 'Davao Branch',
    address: 'Unit 201, Paseo Grande Bldg. Ext. 2, Catalunan Grande Road',
    city: 'Davao City, Philippines',
  },
  {
    label: 'Luzon Office',
    address: 'C. Mercado St., Brgy. Panginay, Guiguinto',
    city: 'Bulacan, Philippines',
  },
]

const inquiryTypes = [
  'Agrochemical Product Inquiry',
  'Product Catalog Request',
  'Manpower / Staffing Request',
  'Job Application',
  'Bulk / Wholesale Order',
  'Partnership Opportunity',
  'General Question',
]

function InputField({ label, id, required, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required.'
    if (!form.email.trim()) {
      errs.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address.'
    }
    if (!form.message.trim()) errs.message = 'Please describe your inquiry.'
    else if (form.message.trim().length < 20) errs.message = 'Message must be at least 20 characters.'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setStatus('sending')

    // Build mailto link as fallback (replace with EmailJS / API in production)
    const subject = encodeURIComponent(`[Inquiry] ${form.inquiryType || 'General'} - ${form.name}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || 'Not provided'}\nInquiry Type: ${form.inquiryType || 'General'}\n\nMessage:\n${form.message}`
    )
    window.location.href = `mailto:cropsaverphil@gmail.com?subject=${subject}&body=${body}`

    setStatus('success')
    setForm({ name: '', email: '', phone: '', inquiryType: '', message: '' })
  }

  return (
    <>
      <SEOHead
        title="Contact Us – Get a Free Consultation"
        description="Contact Crop Saver Philippines Corporation for agrochemical inquiries, product orders, manpower requests, or general questions. Offices in Davao City and Bulacan. Call +63 691 918 908."
        canonical="/contact"
      />

      {/* Page Header */}
      <section className="bg-gradient-to-br from-brand-950 to-brand-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-brand-300 text-sm mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Contact</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">Get in Touch</h1>
          <p className="text-brand-200 text-lg max-w-2xl">
            Whether you need a product recommendation, want to place an order, or are looking for manpower solutions — we're here to help. Expect a response within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left — Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick contact cards */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-display font-bold text-gray-900 mb-5">Quick Contact</h2>
                <div className="space-y-4">
                  <a
                    href="tel:+63691918908"
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-700 transition-colors">
                      <svg className="w-5 h-5 text-brand-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">Call / SMS</div>
                      <div className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">+63 691 918 908</div>
                      <div className="text-xs text-gray-400">Mon–Sat, 9AM–6PM</div>
                    </div>
                  </a>

                  <a
                    href="mailto:cropsaverphil@gmail.com"
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-700 transition-colors">
                      <svg className="w-5 h-5 text-brand-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">Email</div>
                      <div className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors text-sm">cropsaverphil@gmail.com</div>
                      <div className="text-xs text-gray-400">Reply within 24 hours</div>
                    </div>
                  </a>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 bg-[#25D366]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#25D366] transition-colors">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#25D366] group-hover:text-white transition-colors fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">WhatsApp</div>
                      <div className="font-semibold text-gray-900 group-hover:text-[#25D366] transition-colors">Chat with us</div>
                      <div className="text-xs text-gray-400">Fastest response</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Locations */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-display font-bold text-gray-900 mb-5">Our Offices</h2>
                <div className="space-y-5">
                  {locations.map(({ label, address, city }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-brand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{address}</div>
                        <div className="text-xs text-brand-600 font-medium mt-0.5">{city}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">Send Us a Message</h2>
                <p className="text-gray-500 text-sm mb-8">Fill out the form below and our team will get back to you within 24 hours.</p>

                {status === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-display font-bold text-xl text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-500 mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="text-brand-700 font-semibold hover:underline text-sm"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <InputField label="Full Name" id="name" required error={errors.name}>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Juan dela Cruz"
                          autoComplete="name"
                          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                        />
                      </InputField>

                      <InputField label="Phone Number" id="phone" error={errors.phone}>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+63 9XX XXX XXXX"
                          autoComplete="tel"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                        />
                      </InputField>
                    </div>

                    <InputField label="Email Address" id="email" required error={errors.email}>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                      />
                    </InputField>

                    <InputField label="Type of Inquiry" id="inquiryType" error={errors.inquiryType}>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={form.inquiryType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors bg-white text-gray-700"
                      >
                        <option value="">Select inquiry type...</option>
                        {inquiryTypes.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </InputField>

                    <InputField label="Message" id="message" required error={errors.message}>
                      <textarea
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tell us about your farm, crop type, the issue you're facing, or the products/services you need..."
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors resize-none ${errors.message ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                      />
                      <div className="mt-1 text-xs text-gray-400 text-right">{form.message.length} / 1000</div>
                    </InputField>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-600 disabled:opacity-60 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-sm hover:shadow-md"
                      >
                        {status === 'sending' ? (
                          <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        )}
                      </button>
                      <p className="mt-3 text-xs text-gray-400">
                        By submitting this form you agree to be contacted by our team. We do not share your information with third parties.
                      </p>
                    </div>
                  </form>
                )}
              </div>

              {/* Order Now */}
              <div className="mt-6 bg-gold-50 border border-gold-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Ready to place an order?</div>
                  <div className="text-sm text-gray-600">Use our quick order form to submit your product requirements directly.</div>
                </div>
                <a
                  href={ORDER_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-brand-950 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
                >
                  Order Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>

              {/* Alternative CTA */}
              <div className="mt-4 bg-brand-50 border border-brand-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div>
                  <div className="font-semibold text-brand-900 mb-1">Prefer to talk directly?</div>
                  <div className="text-sm text-brand-700">Schedule a free consultation call with our agronomist.</div>
                </div>
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  Schedule a Meeting
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
