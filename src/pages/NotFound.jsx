import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'

export default function NotFound() {
  return (
    <>
      <SEOHead
        title="Page Not Found"
        description="The page you are looking for does not exist."
        noindex
      />
      <section className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-20">
        <div className="text-center px-4">
          <div className="text-8xl font-display font-bold text-brand-100 mb-4">404</div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-3">
            Page Not Found
          </h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Go to Homepage
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-brand-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
