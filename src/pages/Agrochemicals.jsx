import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'

const CATALOG_URL = 'https://framerusercontent.com/assets/k2j52CNH1Qi3CD21VYuxJbVvJhA.pdf'
const ORDER_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdv2LV_ZM7CU43vwzmpI6pU-3YMYtPESjWmTPvIk_TJDfFGrw/viewform'

const categories = ['All', 'Fertilizers', 'Herbicides', 'Insecticides', 'Fungicides', 'Soil Conditioners']

const products = [
  {
    id: 1,
    name: 'Premium Foliar Fertilizer',
    category: 'Fertilizers',
    badge: 'Best Seller',
    badgeColor: 'bg-gold-500 text-brand-950',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&q=75',
    imageAlt: 'Crop spraying with foliar fertilizer',
    description: 'Complete macro and micronutrient foliar spray for fast uptake and visible results within 7 days. Ideal for bananas, pineapples, and vegetables.',
    crops: ['Banana', 'Pineapple', 'Vegetables', 'Rice'],
    benefits: ['Boosts leaf greenness', 'Improves fruit size', 'Enhances stress tolerance'],
  },
  {
    id: 2,
    name: 'Broad-Spectrum Herbicide',
    category: 'Herbicides',
    badge: 'Popular',
    badgeColor: 'bg-brand-100 text-brand-700',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=75',
    imageAlt: 'Weed control in rice paddy field',
    description: 'Effective pre- and post-emergent weed control for a wide range of broadleaf and grassy weeds. Low-toxicity formula safe for surrounding crops.',
    crops: ['Rice', 'Corn', 'Sugarcane', 'Vegetables'],
    benefits: ['Pre & post-emergent', 'Fast-acting formula', 'Rain-resistant'],
  },
  {
    id: 3,
    name: 'Systemic Insecticide',
    category: 'Insecticides',
    badge: null,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=75',
    imageAlt: 'Healthy banana crops protected from pests',
    description: 'Systemic protection against sucking and chewing insects including aphids, thrips, and leafhoppers. Long residual activity up to 21 days.',
    crops: ['Vegetables', 'Banana', 'Rice', 'Corn'],
    benefits: ['21-day residual', 'Systemic action', 'Broad-spectrum control'],
  },
  {
    id: 4,
    name: 'Soil pH Conditioner',
    category: 'Soil Conditioners',
    badge: 'Recommended',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=75',
    imageAlt: 'Rich healthy soil for farming',
    description: 'Corrects soil acidity and improves nutrient availability. Essential for farms with clay-heavy soils common in Mindanao and Visayas.',
    crops: ['All Crops'],
    benefits: ['Corrects soil pH', 'Improves CEC', 'Enhances microbial activity'],
  },
  {
    id: 5,
    name: 'Protective Fungicide',
    category: 'Fungicides',
    badge: null,
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=75',
    imageAlt: 'Healthy green vegetable crops',
    description: 'Multi-site protectant fungicide for prevention and control of leaf spots, blights, and downy mildew. Water-dispersible granule for easy mixing.',
    crops: ['Vegetables', 'Banana', 'Rice'],
    benefits: ['Preventive & curative', 'Rainfast in 2 hours', 'Safe residue profile'],
  },
  {
    id: 6,
    name: 'NPK Complete Fertilizer',
    category: 'Fertilizers',
    badge: 'New',
    badgeColor: 'bg-blue-100 text-blue-700',
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&q=75',
    imageAlt: 'Lush green crop field with good nutrition',
    description: 'Balanced 20-20-20 NPK formula with added micronutrients for all-stage crop nutrition. Fully water-soluble for fertigation and foliar use.',
    crops: ['All Crops'],
    benefits: ['All-stage nutrition', 'Fully water-soluble', 'Fertigation compatible'],
  },
  {
    id: 7,
    name: 'Contact Herbicide',
    category: 'Herbicides',
    badge: null,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=75',
    imageAlt: 'Corn and rice fields',
    description: 'Fast-acting contact herbicide for burndown of emerged weeds before planting. Visible results in 24–48 hours.',
    crops: ['Rice', 'Corn', 'Sugarcane'],
    benefits: ['24-48hr visible action', 'No soil residue', 'Flexible application'],
  },
  {
    id: 8,
    name: 'Humic Acid Soil Booster',
    category: 'Soil Conditioners',
    badge: 'Organic',
    badgeColor: 'bg-amber-100 text-amber-700',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=75',
    imageAlt: 'Healthy plant roots in enriched soil',
    description: 'High-concentration humic and fulvic acid concentrate that improves soil structure, water retention, and root development.',
    crops: ['All Crops'],
    benefits: ['Improves water retention', 'Stimulates roots', 'Enhances fertilizer uptake'],
  },
]

const cropTypes = [
  { name: 'Bananas', icon: '🍌' },
  { name: 'Pineapples', icon: '🍍' },
  { name: 'Vegetables', icon: '🥬' },
  { name: 'Rice', icon: '🌾' },
  { name: 'Corn', icon: '🌽' },
  { name: 'Coconut', icon: '🥥' },
  { name: 'Sugarcane', icon: '🎋' },
  { name: 'Other Crops', icon: '🌱' },
]

export default function Agrochemicals() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory)

  return (
    <>
      <SEOHead
        title="Agrochemicals & Crop Protection Products"
        description="Browse Crop Saver's range of certified agrochemicals – fertilizers, herbicides, insecticides, fungicides, and soil conditioners for Filipino farmers. Supporting bananas, rice, vegetables, and more."
        canonical="/agrochemicals"
      />

      {/* Page Header */}
      <section className="relative bg-gradient-to-br from-brand-950 to-brand-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=80"
            alt="Lush green crop fields"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-brand-300 text-sm mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Agrochemicals</span>
          </nav>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
                Agricultural Products & Crop Protection
              </h1>
              <p className="text-brand-200 text-lg leading-relaxed mb-8">
                Science-formulated agrochemicals for Philippine farms. From foliar nutrition to pest control — we carry proven solutions for every crop stage.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={CATALOG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-brand-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Product Catalog (PDF)
                </a>
                <a
                  href={ORDER_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all"
                >
                  Order Now
                </a>
              </div>
            </div>
            {/* Crop icons */}
            <div className="grid grid-cols-4 gap-3">
              {cropTypes.map(({ name, icon }) => (
                <div key={name} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center hover:bg-white/15 transition-colors">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-xs text-brand-200 font-medium">{name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATALOG DOWNLOAD BANNER ── */}
      <section className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-brand-900 text-sm">Full Product Catalog Available</span>
                <span className="text-brand-600 text-sm ml-2">— View all products, specifications, and application guides in one document.</span>
              </div>
            </div>
            <a
              href={CATALOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF Catalog
            </a>
          </div>
        </div>
      </section>

      {/* Product Catalog */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900">Our Product Range</h2>
              <p className="text-gray-500 text-sm mt-1">{filtered.length} product{filtered.length !== 1 ? 's' : ''} available</p>
            </div>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-brand-700 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-brand-100 transition-all group flex flex-col">
                {/* Product image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {product.badge && (
                    <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${product.badgeColor}`}>
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 text-xs bg-white/90 text-brand-700 font-semibold px-2.5 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-gray-900 group-hover:text-brand-700 transition-colors mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{product.description}</p>

                  <div className="space-y-1.5 mb-4">
                    {product.benefits.map(b => (
                      <div key={b} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {b}
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-400 mb-2">Suitable for:</div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {product.crops.map(crop => (
                        <span key={crop} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{crop}</span>
                      ))}
                    </div>
                    <a
                      href={`https://wa.me/63691918908?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20${encodeURIComponent(product.name)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-brand-50 hover:bg-brand-700 text-brand-700 hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all border border-brand-100 hover:border-brand-700"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Inquire via WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Inquiry CTA */}
          <div className="mt-16 bg-brand-800 rounded-3xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">
              Not Sure Which Product is Right for Your Crop?
            </h2>
            <p className="text-brand-200 mb-8 max-w-2xl mx-auto">
              Our agronomists will analyze your farm's situation and recommend the most effective and cost-efficient solution. Free consultation, no obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-brand-950 font-bold px-8 py-4 rounded-xl transition-all shadow-lg"
              >
                Ask an Agronomist
              </Link>
              <a
                href={ORDER_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all"
              >
                Place an Order
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
