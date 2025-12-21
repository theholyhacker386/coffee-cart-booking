// Customer Landing Page - First thing customers see
// Clean, elegant, black and white design for weddings and events

import Link from 'next/link'
import Image from 'next/image'

export default function CustomerLandingPage() {
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
                  Fill out your event details and provide payment information (not charged yet)
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

      {/* Footer */}
      <footer className="border-t border-black/10 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-gray-600">
          <p className="text-sm sm:text-base">© {new Date().getFullYear()} The Porch Coffee Bar</p>
          <p className="mt-2 text-xs sm:text-sm">Serving unforgettable moments, one cup at a time</p>
          <div className="mt-4 space-y-1 text-xs sm:text-sm">
            <p><a href="tel:3868826560" className="hover:text-black">📞 386-882-6560</a></p>
            <p><a href="mailto:theporchkombuchabar@gmail.com" className="hover:text-black break-all">✉️ Theporchkombuchabar@gmail.com</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
