import { Link } from 'react-router-dom'

const footerLinks = {
  Company: [
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ],
  Services: [
    { to: '/agrochemicals', label: 'Agrochemicals' },
    { to: '/manpower', label: 'Manpower Services' },
  ],
}

const locations = [
  {
    label: 'Main Office',
    address: 'Parenas St. Km. 08, Carlos Garcia Highway, Brgy. Cabantian, Davao City',
  },
  {
    label: 'Branch Office',
    address: 'Unit 201, Paseo Grande Bldg. Ext. 2, Catalunan Grande Road, Davao City',
  },
  {
    label: 'Luzon Office',
    address: 'C. Mercado St., Brgy. Panginay, Guiguinto, Bulacan',
  },
]

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src="/crop_saver_logo.png" alt="Crop Saver Philippines" className="h-10 w-auto object-contain bg-white rounded-lg p-1" />
              <div>
                <span className="block text-white font-display font-bold text-lg leading-tight">Crop Saver</span>
                <span className="block text-brand-300 text-xs">Philippines Corporation</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Empowering Filipino farmers with science-backed agrochemicals and quality workforce solutions since 2018.
            </p>
            <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide">The Farmer's Partner</p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-gray-400 hover:text-brand-300 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="tel:+63691918908" className="flex items-start gap-2 hover:text-brand-300 transition-colors">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +63 691 918 908
                </a>
              </li>
              <li>
                <a href="mailto:cropsaverphil@gmail.com" className="flex items-start gap-2 hover:text-brand-300 transition-colors">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  cropsaverphil@gmail.com
                </a>
              </li>
              <li className="text-xs text-gray-500">Mon–Sat, 9:00 AM – 6:00 PM</li>
            </ul>
          </div>
        </div>

        {/* Locations */}
        <div className="mt-12 pt-8 border-t border-brand-900">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Our Offices</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {locations.map(({ label, address }) => (
              <div key={label} className="flex items-start gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <span className="block text-brand-300 font-medium">{label}</span>
                  <span className="text-xs">{address}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-brand-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Crop Saver Philippines Corporation. All rights reserved.</span>
          <span>Established August 8, 2018 · Davao City, Philippines</span>
        </div>
      </div>
    </footer>
  )
}
