import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'

const serviceTypes = [
  {
    title: 'Skilled Workers',
    icon: '🔧',
    desc: 'Certified technicians, operators, and tradespeople with verified skill assessments and experience in agricultural and industrial settings.',
  },
  {
    title: 'Temporary Workers',
    icon: '📅',
    desc: 'Flexible short-term workforce solutions for seasonal harvests, peak production periods, and project-based operations.',
  },
  {
    title: 'Piece Work Labor',
    icon: '📦',
    desc: 'Output-based workers for sorting, packing, harvesting, and processing — paid per unit for maximum efficiency.',
  },
  {
    title: 'Professional Workers',
    icon: '👔',
    desc: 'Supervisors, agronomists, farm managers, and administrative staff for leadership roles in your agricultural business.',
  },
  {
    title: 'Contractual Workers',
    icon: '📋',
    desc: 'Fixed-term contract placements with defined deliverables and durations — ideal for specific projects or seasonal campaigns.',
  },
  {
    title: 'Permanent Placements',
    icon: '🏆',
    desc: 'Long-term direct hire placements for core team roles. We handle sourcing, vetting, and onboarding support.',
  },
]

const process = [
  { step: '01', title: 'Submit Your Requirements', desc: 'Tell us what roles you need, how many workers, required skills, and your timeline.' },
  { step: '02', title: 'Candidate Sourcing', desc: 'We tap our database of vetted applicants and run targeted recruitment drives if needed.' },
  { step: '03', title: 'Screening & Assessment', desc: 'Applicants undergo background checks, interviews, and position-specific skill evaluations.' },
  { step: '04', title: 'Client Shortlisting', desc: 'We present you with a curated shortlist of qualified candidates for your final review.' },
  { step: '05', title: 'Deployment & Onboarding', desc: 'We coordinate deployment logistics and provide onboarding support to ensure smooth integration.' },
  { step: '06', title: 'Ongoing Support', desc: 'We remain available for replacement, feedback, and any workforce concerns throughout engagement.' },
]

const stats = [
  { value: '3,000+', label: 'Jobs Provided' },
  { value: '200+', label: 'Business Clients' },
  { value: '7 Years', label: 'Industry Experience' },
  { value: '95%', label: 'Client Retention Rate' },
]

export default function Manpower() {
  return (
    <>
      <SEOHead
        title="Manpower & Workforce Solutions"
        description="Crop Saver Philippines provides vetted skilled workers, temporary labor, and professional placements for agricultural and industrial businesses. 3,000+ jobs provided. Serving Davao and Bulacan."
        canonical="/manpower"
      />

      {/* Page Header */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-gray-400 text-sm mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Manpower Services</span>
          </nav>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
                Workforce Solutions for Philippine Businesses
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                We match job-ready workers with businesses across the Philippines. Every candidate is screened, assessed, and prepared to contribute from day one.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-brand-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg"
                >
                  Hire Workers Now
                </Link>
                <a
                  href="https://forms.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl transition-all"
                >
                  Apply as a Worker
                </a>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ value, label }) => (
                <div key={label} className="bg-white/10 border border-white/10 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-display font-bold text-gold-400 mb-1">{value}</div>
                  <div className="text-sm text-gray-300">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-widest">What We Offer</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-gray-900">
              Flexible Workforce Solutions
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Whether you need a single specialist or an entire harvest crew, we have the right staffing solution for your operation.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceTypes.map(({ title, icon, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-display font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two-sided value prop */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* For Employers */}
            <div className="bg-brand-800 rounded-3xl p-8 sm:p-10 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-bold mb-3">For Employers</h2>
              <p className="text-brand-200 mb-6">Stop wasting time on unqualified applicants. Get pre-screened, job-ready workers delivered to your operation.</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Background-checked candidates',
                  'Skills-matched placements',
                  'Fast turnaround — workers within days',
                  'Replacement guarantee',
                  'Flexible engagement terms',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-brand-100">
                    <svg className="w-4 h-4 text-gold-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-brand-800 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors"
              >
                Request Workers
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* For Job Seekers */}
            <div className="bg-gray-800 rounded-3xl p-8 sm:p-10 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-bold mb-3">For Job Seekers</h2>
              <p className="text-gray-300 mb-6">We connect qualified workers with stable opportunities across agriculture, manufacturing, and services sectors.</p>
              <ul className="space-y-3 mb-8">
                {[
                  'No placement fee for applicants',
                  'Jobs across Davao and Bulacan',
                  'Regular and contractual positions',
                  'Career development support',
                  'Fair wages and legal compliance',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-gold-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/63906257831?text=Hello%2C%20I%20would%20like%20to%20apply%20for%20a%20job%20through%20Crop%20Saver%20Philippines."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b558] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Apply via WhatsApp
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-widest">How It Works</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-gray-900">
              Our Placement Process
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map(({ step, title, desc }) => (
              <div key={step} className="relative p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0 group-hover:bg-brand-700 group-hover:text-white transition-colors">
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

      {/* CTA */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
            Need Workers for Your Business?
          </h2>
          <p className="text-gray-300 mb-8">
            Contact us today. Tell us your requirements and we'll have qualified candidates ready within days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-brand-950 font-bold px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              Send a Staffing Request
            </Link>
            <a
              href="tel:+63906257831"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Manpower Line
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
