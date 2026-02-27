// Customer Landing Page - First thing customers see
// Clean, elegant, black and white design for weddings and events

import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Porch Coffee Bar | Mobile Coffee Cart for Weddings & Events',
  description:
    'Premium mobile coffee cart service for weddings, parties, and corporate events in Georgia. Handcrafted espresso, lattes, and specialty drinks brought to your venue. Book online today!',
  openGraph: {
    title: 'The Porch Coffee Bar | Mobile Coffee Cart for Events',
    description:
      'Premium mobile coffee cart service for weddings, parties, and events. Handcrafted beverages brought to your venue.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function CustomerLandingPage() {
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL
  const tiktokUrl = process.env.NEXT_PUBLIC_TIKTOK_URL

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Top of page */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 text-center">
        {/* Logo - The Porch Coffee Bar */}
        <div className="mb-8 sm:mb-12">
          <Image
            src="/the porch coffe bar logo.png"
            alt="The Porch Coffee Bar"
            width={150}
            height={150}
            className="mx-auto sm:w-[200px] sm:h-[200px]"
            priority
          />
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-black mb-4 sm:mb-6">
          Elevated Coffee Experience
        </h1>

        <p className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
          Premium mobile coffee cart service for weddings, parties, and special events.
          Serving handcrafted beverages that make your occasion unforgettable.
        </p>

        {/* Main Call-to-Action Button */}
        <Link
          href="/customer/book"
          className="inline-block bg-black text-white px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-medium hover:bg-gray-800 transition-colors rounded-lg touch-manipulation"
        >
          Book Your Event
        </Link>
      </div>

      {/* Features Section - Why choose us */}
      <div className="border-t border-black/10 py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-serif text-black text-center mb-8 sm:mb-12">
            Why Choose Us
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 border-2 border-black rounded-full flex items-center justify-center">
                <span className="text-2xl">☕</span>
              </div>
              <h3 className="text-xl font-medium text-black mb-3">
                Premium Coffee
              </h3>
              <p className="text-gray-600">
                Specialty-grade beans and professional baristas for every event
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 border-2 border-black rounded-full flex items-center justify-center">
                <span className="text-2xl">🚐</span>
              </div>
              <h3 className="text-xl font-medium text-black mb-3">
                Mobile Service
              </h3>
              <p className="text-gray-600">
                We come to you with everything needed for your perfect event
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 border-2 border-black rounded-full flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-medium text-black mb-3">
                Simple Booking
              </h3>
              <p className="text-gray-600">
                Easy online booking with instant confirmation for your date
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What We Serve Section */}
      <div className="border-t border-black/10 py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-serif text-black text-center mb-8 sm:mb-12">
            What We Serve
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">☕</div>
              <h4 className="font-medium text-black">Espresso Drinks</h4>
              <p className="text-sm text-gray-500 mt-1">Lattes, cappuccinos, americanos</p>
            </div>
            <div>
              <div className="text-3xl mb-3">🧊</div>
              <h4 className="font-medium text-black">Iced & Blended</h4>
              <p className="text-sm text-gray-500 mt-1">Cold brew, frappes, iced lattes</p>
            </div>
            <div>
              <div className="text-3xl mb-3">🍵</div>
              <h4 className="font-medium text-black">Tea & More</h4>
              <p className="text-sm text-gray-500 mt-1">Matcha, chai, hot chocolate</p>
            </div>
            <div>
              <div className="text-3xl mb-3">🥤</div>
              <h4 className="font-medium text-black">Specialty Drinks</h4>
              <p className="text-sm text-gray-500 mt-1">Seasonal flavors & custom menus</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-black/5 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-serif text-black text-center mb-8 sm:mb-12">
            How It Works
          </h2>

          <div className="space-y-6 sm:space-y-8">
            {/* Step 1 */}
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                1
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-medium text-black mb-2">
                  Choose Your Package
                </h4>
                <p className="text-sm sm:text-base text-gray-600">
                  Select from our curated coffee service packages designed for events of all sizes
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                2
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-medium text-black mb-2">
                  Submit Your Request
                </h4>
                <p className="text-sm sm:text-base text-gray-600">
                  Fill out your event details and we&apos;ll get back to you within 24 hours
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                3
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-medium text-black mb-2">
                  We Confirm Your Booking
                </h4>
                <p className="text-sm sm:text-base text-gray-600">
                  We review and confirm within 24 hours. Your card is only charged once we approve
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                4
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-medium text-black mb-2">
                  Enjoy Your Event
                </h4>
                <p className="text-sm sm:text-base text-gray-600">
                  We arrive on time with everything needed for an exceptional coffee experience
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12 sm:mt-16">
            <Link
              href="/customer/book"
              className="inline-block bg-black text-white px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-medium hover:bg-gray-800 transition-colors rounded-lg touch-manipulation"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Perfect For Section */}
      <div className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif text-black mb-8 sm:mb-12">
            Perfect For
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { label: 'Weddings', icon: '💒' },
              { label: 'Birthday Parties', icon: '🎂' },
              { label: 'Corporate Events', icon: '🏢' },
              { label: 'Baby Showers', icon: '🍼' },
              { label: 'Holiday Parties', icon: '🎄' },
              { label: 'Pop-Up Markets', icon: '🛍️' },
            ].map(({ label, icon }) => (
              <div
                key={label}
                className="border border-black/10 rounded-lg py-4 sm:py-6 px-3 hover:bg-black/5 transition-colors"
              >
                <div className="text-2xl sm:text-3xl mb-2">{icon}</div>
                <p className="text-sm sm:text-base font-medium text-black">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-black/10 py-8 sm:py-12 bg-black/[.02]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-gray-600">
          <Image
            src="/the porch coffe bar logo.png"
            alt="The Porch Coffee Bar"
            width={60}
            height={60}
            className="mx-auto mb-4"
          />
          <p className="text-sm sm:text-base font-medium text-black">The Porch Coffee Bar</p>
          <p className="mt-1 text-xs sm:text-sm">Serving unforgettable moments, one cup at a time</p>

          {/* Contact */}
          <div className="mt-4 space-y-1 text-xs sm:text-sm">
            <p><a href="tel:3868826560" className="hover:text-black transition-colors">386-882-6560</a></p>
            <p><a href="mailto:theporchkombuchabar@gmail.com" className="hover:text-black transition-colors break-all">theporchkombuchabar@gmail.com</a></p>
          </div>

          {/* Social Links */}
          {(instagramUrl || facebookUrl || tiktokUrl) && (
            <div className="flex justify-center gap-5 mt-5">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-black transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-black transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-400 hover:text-black transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
              )}
            </div>
          )}

          <p className="mt-6 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} The Porch Coffee Bar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
