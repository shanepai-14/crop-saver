import SEOHead from '../components/SEOHead'
import { Link } from 'react-router-dom'

const values = [
  { icon: 'ðŸ†', title: 'Excellence', desc: 'We hold ourselves to the highest standards in every product and service we deliver.' },
  { icon: 'ðŸ¤', title: 'Integrity', desc: 'Honest and transparent in all our dealings with farmers, clients, and partners.' },
  { icon: 'âš¡', title: 'Efficacy', desc: 'Our products deliver measurable results â€” real yield improvements, real crop protection.' },
  { icon: 'ðŸ‘¥', title: 'Teamwork', desc: 'Our strength lies in our people â€” experts who collaborate to find the best solutions for you.' },
  { icon: 'ðŸŽ¯', title: 'Results-Oriented', desc: 'We measure success by your success â€” improved yields, healthier crops, growing businesses.' },
  { icon: 'ðŸ’š', title: 'Customer Focus', desc: "Quality service is not just what we do, it's who we are â€” 5,000+ clients trust us every season." },
]

const milestones = [
  { year: '2018', title: 'Founded in Davao City', desc: 'Crop Saver Philippines Corporation was established on August 8, 2018, with a mission to serve Filipino farmers with quality agrochemicals.' },
  { year: '2019', title: 'Expanded Product Line', desc: 'Grew our catalog to include a comprehensive range of foliar fertilizers, herbicides, and crop protection products.' },
  { year: '2020', title: 'Manpower Services Launched', desc: 'Extended our mission to help Filipino workers by launching our manpower placement and staffing division.' },
  { year: '2022', title: 'Luzon Office Opened', desc: 'Opened our Bulacan office to better serve farmers in Luzon and expand our nationwide footprint.' },
  { year: '2024', title: '5,000+ Clients Served', desc: 'Reached a major milestone of 5,000 satisfied farming clients across the Philippines.' },
]

const team = [
  {
    name: 'Marco Villanueva',
    title: 'Chief Executive Officer',
    bio: 'Over 15 years in agricultural business development across Mindanao. Marco founded CSPC with a vision to make world-class crop inputs accessible to every Filipino farmer.',
    initials: 'MV',
    color: '166534',
    expertise: ['Agribusiness', 'Strategy', 'Operations'],
  },
  {
    name: 'Dr. Ana Reyes',
    title: 'Chief Agronomist',
    bio: 'PhD in Plant Pathology from Visayas State University. Ana leads our technical team and develops customized crop protection programs for our clients.',
    initials: 'AR',
    color: '15803d',
    expertise: ['Plant Pathology', 'Crop Science', 'Soil Health'],
  },
  {
    name: 'Benjamin Santos',
    title: 'Head of Sales & Operations',
    bio: 'With 10+ years in agricultural distribution, Ben manages our nationwide sales network and ensures products reach farmers on time and within budget.',
    initials: 'BS',
    color: '1a5c2a',
    expertise: ['Sales Management', 'Logistics', 'Client Relations'],
  },
  {
    name: 'Carla Mendoza',
    title: 'Manpower Division Manager',
    bio: 'A certified HR professional with experience across manufacturing and agriculture. Carla oversees talent sourcing, vetting, and deployment for all manpower clients.',
    initials: 'CM',
    color: '92400e',
    expertise: ['Human Resources', 'Recruitment', 'Labor Law'],
  },
  {
    name: 'Engr. Rico Delos Santos',
    title: 'Technical Field Supervisor',
    bio: 'Agricultural Engineer covering Davao Region. Rico conducts farm visits, provides on-site training, and ensures proper product application for optimal results.',
    initials: 'RD',
    color: '065f46',
    expertise: ['Farm Engineering', 'Training', 'Field Support'],
  },
  {
    name: 'Grace Tan',
    title: 'Luzon Area Manager',
    bio: 'Based in our Bulacan office, Grace manages relationships with rice and vegetable farmers across Central Luzon and Metro Manila supply chain.',
    initials: 'GT',
    color: '1e40af',
    expertise: ['Luzon Region', 'Rice & Vegetables', 'Supply Chain'],
  },
]

export default function About() {
  return (
    <>
      <SEOHead
        title="About Us"
        description="Learn about Crop Saver Philippines Corporation â€“ established in 2018, we empower Filipino farmers with quality agrochemicals, expert consultation, and workforce solutions. The Farmer's Partner."
        canonical="/about"
      />

      {/* Page Header */}
      <section className="relative bg-gradient-to-br from-brand-950 to-brand-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80"
            alt="Green fields"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-2 text-brand-300 text-sm mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white">About Us</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              The Farmer's Trusted Partner
            </h1>
            <p className="text-brand-200 text-lg leading-relaxed">
              Since 2018, we've been on a mission to empower Filipino farmers with the science, products, and support they need to protect their crops and grow their livelihoods.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-brand-600 font-semibold text-sm uppercase tracking-widest">Our Story</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-6">
                Built on a Deep Respect for Filipino Farmers
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Crop Saver Philippines Corporation was founded on August 8, 2018, in the agricultural heartland of Davao City. We started with a simple but powerful belief: Filipino farmers deserve access to world-class agrochemical products at fair, accessible prices.
                </p>
                <p>
                  What began as a small operation serving local farmers in Davao has grown into a nationwide agricultural partner, with offices in Davao City and Bulacan, serving over 5,000 clients across Mindanao, Visayas, and Luzon.
                </p>
                <p>
                  We specialize in two core areas: premium agrochemicals that protect crops and enhance yields, and manpower solutions that connect skilled workers with businesses across the Philippines. Both arms of our business share the same DNA â€” quality, integrity, and a commitment to the people we serve.
                </p>
              </div>
              <div className="mt-8 flex gap-6">
                <div>
                  <div className="text-3xl font-display font-bold text-brand-700">7+</div>
                  <div className="text-sm text-gray-500">Years in business</div>
                </div>
                <div className="w-px bg-gray-200" />
                <div>
                  <div className="text-3xl font-display font-bold text-brand-700">3</div>
                  <div className="text-sm text-gray-500">Office locations</div>
                </div>
                <div className="w-px bg-gray-200" />
                <div>
                  <div className="text-3xl font-display font-bold text-brand-700">5K+</div>
                  <div className="text-sm text-gray-500">Happy clients</div>
                </div>
              </div>
            </div>

            {/* Image + quote */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1595508064774-5ff825520bb0?w=700&q=80"
                  alt="Filipino farmers in the field with agronomist"
                  className="w-full h-72 object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-xs">
                <svg className="w-6 h-6 text-brand-300 mb-2" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H6c0-2.2 1.8-4 4-4V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-8c0-2.2 1.8-4 4-4V8z"/>
                </svg>
                <p className="text-sm font-semibold text-gray-800 leading-snug">
                  "Dedicated to helping farmers protect their crops, enhance their soil, and achieve greater yields."
                </p>
                <div className="mt-2 text-xs text-brand-600 font-medium">â€” CSPC Management Team</div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gold-100 rounded-full -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-display font-bold text-gray-900">Vision</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To be the science leader by empowering people to improve their lives and provide the best solution from Startâ€“Growâ€“Finish stages at reasonably lower prices.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gold-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-display font-bold text-gray-900">Mission</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Unleashing the Power of PLANTS through innovation and knowledge â€” equipping every Filipino farmer with the science, tools, and support they need to feed families, build businesses, and sustain communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ OUR TEAM â”€â”€ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-widest">The People Behind CSPC</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-gray-900">Meet Our Team</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Our team combines deep agronomy expertise with field experience across the Philippines â€” dedicated professionals who are as passionate about farming as you are.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map(({ name, title, bio, initials, color, expertise }) => (
              <div key={name} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-brand-100 transition-all">
                {/* Card header with gradient background */}
                <div
                  className="h-24 relative"
                  style={{ background: `linear-gradient(135deg, #${color}22, #${color}44)` }}
                >
                  <div className="absolute -bottom-8 left-6">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=80&bold=true&font-size=0.35`}
                      alt={name}
                      className="w-16 h-16 rounded-2xl border-4 border-white shadow-md"
                    />
                  </div>
                </div>

                <div className="pt-10 px-6 pb-6">
                  <h3 className="font-display font-bold text-gray-900 text-lg group-hover:text-brand-700 transition-colors">
                    {name}
                  </h3>
                  <p className="text-brand-600 font-semibold text-sm mb-3">{title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{bio}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {expertise.map(tag => (
                      <span key={tag} className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Join us CTA */}
          <div className="mt-12 bg-brand-50 border border-brand-100 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-xl text-brand-900 mb-1">Join Our Growing Team</h3>
              <p className="text-brand-700 text-sm">We're always looking for passionate agronomists, field technicians, and business professionals.</p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 bg-brand-700 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm text-sm"
            >
              Send Your Resume
            </Link>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-widest">What We Stand For</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-gray-900">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-brand-200 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-display font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-widest">Our Journey</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-gray-900">Key Milestones</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-brand-100" />
            <div className="space-y-8">
              {milestones.map(({ year, title, desc }) => (
                <div key={year} className="relative flex gap-6">
                  <div className="w-16 h-16 bg-brand-700 text-white rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0 z-10 shadow-md">
                    {year}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-100 mt-2">
                    <h3 className="font-display font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
            Ready to Work with The Farmer's Partner?
          </h2>
          <p className="text-brand-200 mb-8">Get in touch with our team and find out how we can help your crops thrive.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-brand-950 font-bold px-8 py-4 rounded-xl transition-all shadow-lg"
          >
            Contact Us Today
          </Link>
        </div>
      </section>
    </>
  )
}

