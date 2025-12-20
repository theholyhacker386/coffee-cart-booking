// Customer Landing Page - First thing customers see
// Clean, elegant, black and white design for weddings and events

import Link from 'next/link'
import Image from 'next/image'

export default function CustomerLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Top of page */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        {/* Logo - The Porch Coffee Bar */}
        <div className="mb-12">
          <Image
            src="/the porch coffe bar logo.png"
            alt="The Porch Coffee Bar"
            width={200}
            height={200}
            className="mx-auto"
            priority
          />
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-6xl font-serif text-black mb-6">
          Elevated Coffee Experience
        </h1>

        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Premium mobile coffee cart service for weddings, parties, and special events.
          Serving handcrafted beverages that make your occasion unforgettable.
        </p>

        {/* Main Call-to-Action Button */}
        <Link
          href="/customer/book"
          className="inline-block bg-black text-white px-12 py-4 text-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Book Your Event
        </Link>
      </div>

      {/* Features Section - Why choose us */}
      <div className="border-t border-black/10 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
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

      {/* How It Works Section */}
      <div className="bg-black/5 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-serif text-black text-center mb-12">
            How It Works
          </h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="text-xl font-medium text-black mb-2">
                  Choose Your Package
                </h4>
                <p className="text-gray-600">
                  Select from our curated coffee service packages designed for events of all sizes
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="text-xl font-medium text-black mb-2">
                  Submit Your Request
                </h4>
                <p className="text-gray-600">
                  Fill out your event details and provide payment information (not charged yet)
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="text-xl font-medium text-black mb-2">
                  We Confirm Your Booking
                </h4>
                <p className="text-gray-600">
                  We review and confirm within 24 hours. Your card is only charged once we approve
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="text-xl font-medium text-black mb-2">
                  Enjoy Your Event
                </h4>
                <p className="text-gray-600">
                  We arrive on time with everything needed for an exceptional coffee experience
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <Link
              href="/customer/book"
              className="inline-block bg-black text-white px-12 py-4 text-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-black/10 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-600">
          <p>© {new Date().getFullYear()} The Porch Coffee Bar</p>
          <p className="mt-2 text-sm">Serving unforgettable moments, one cup at a time</p>
          <div className="mt-4 space-y-1 text-sm">
            <p>📞 386-882-6560</p>
            <p>✉️ Theporchkombuchabar@gmail.com</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
