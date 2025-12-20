'use client'

// Booking Inquiry Form - Collects event details and sends inquiry
// No payment collection - just inquiry submission

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Script from 'next/script'

export default function BookingInquiryForm() {
  // Google Maps autocomplete reference
  const addressInputRef = useRef<HTMLInputElement>(null)
  // Event Type
  const [eventCategory, setEventCategory] = useState<'private' | 'public' | ''>('')
  const [estimatedPeople, setEstimatedPeople] = useState('')

  // Customer Info
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventAddress, setEventAddress] = useState('')

  // Event Type
  const [eventType, setEventType] = useState('')
  const [customEventType, setCustomEventType] = useState('')

  // Event Details
  const [eventStartTime, setEventStartTime] = useState('')
  const [powerAvailable, setPowerAvailable] = useState<'yes' | 'no' | ''>('')
  const [distanceFromPower, setDistanceFromPower] = useState('')
  const [indoorOutdoor, setIndoorOutdoor] = useState<'indoor' | 'outdoor' | ''>('')
  const [sinkAvailable, setSinkAvailable] = useState<'yes' | 'no' | ''>('')
  const [trashOnSite, setTrashOnSite] = useState<'yes' | 'no' | ''>('')

  // Day-of Contact
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  // Service Selection (Private Events Only)
  const [extraHours, setExtraHours] = useState(0)
  const [drinkPackage, setDrinkPackage] = useState<'drip' | 'standard' | 'premium' | 'kombucha' | 'hotchoc' | ''>('')
  const [numberOfDrinks, setNumberOfDrinks] = useState(25)
  const [drinkLimit, setDrinkLimit] = useState<'stop' | 'contact' | ''>('')
  const [paymentMethod, setPaymentMethod] = useState<'openbar' | 'ticket' | 'guestpay' | ''>('')

  // Add-ons (Private Events Only)
  const [hotChocolate, setHotChocolate] = useState(false)
  const [kombucha, setKombucha] = useState(false)
  const [kombuchaQuantity, setKombuchaQuantity] = useState(0)

  // Agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [signature, setSignature] = useState('')
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0])

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (place.formatted_address) {
          setEventAddress(place.formatted_address)
        }
      })
    }
  }, [])

  // Calculate tier and pricing (Private Events Only)
  const calculatePricing = () => {
    if (eventCategory !== 'private') return { tier: 0, baseFee: 0, hourlyRate: 0, totalHours: 2 + extraHours, freeHours: 0 }

    const totalHours = 2 + extraHours

    // Tier 1: 25-74 drinks
    if (numberOfDrinks >= 25 && numberOfDrinks <= 74) {
      return {
        tier: 1,
        baseFee: 200,
        hourlyRate: 50,
        totalHours,
        freeHours: 0
      }
    }

    // Tier 2: 75-99 drinks
    if (numberOfDrinks >= 75 && numberOfDrinks <= 99) {
      return {
        tier: 2,
        baseFee: 150,
        hourlyRate: 37.50,
        totalHours,
        freeHours: 0
      }
    }

    // Tier 3: 100-199 drinks
    if (numberOfDrinks >= 100 && numberOfDrinks <= 199) {
      return {
        tier: 3,
        baseFee: 100,
        hourlyRate: 25,
        totalHours,
        freeHours: 0
      }
    }

    // Tier 4: 200+ drinks
    if (numberOfDrinks >= 200) {
      const extraDrinks = numberOfDrinks - 200
      const bonusHours = Math.floor(extraDrinks / 30)
      const freeHours = 2 + bonusHours

      return {
        tier: 4,
        baseFee: 0,
        hourlyRate: 25,
        totalHours,
        freeHours: Math.min(freeHours, totalHours)
      }
    }

    return { tier: 0, baseFee: 0, hourlyRate: 0, totalHours, freeHours: 0 }
  }

  const pricing = calculatePricing()

  const calculateTotal = () => {
    if (eventCategory === 'public') return 0

    let total = 0

    if (pricing.tier === 4) {
      // Tier 4: First hours are free, pay for extra
      const paidHours = Math.max(0, pricing.totalHours - pricing.freeHours)
      total = paidHours * pricing.hourlyRate
    } else {
      // Tiers 1-3: Base fee + hourly
      total = pricing.baseFee + (extraHours * pricing.hourlyRate)
    }

    // Add drink costs
    if (drinkPackage === 'drip') {
      total += numberOfDrinks * 5
      if (hotChocolate) total += 25
    } else if (drinkPackage === 'standard') {
      total += numberOfDrinks * 6
    } else if (drinkPackage === 'premium') {
      total += numberOfDrinks * 7
    } else if (drinkPackage === 'kombucha') {
      total += numberOfDrinks * 6
    } else if (drinkPackage === 'hotchoc') {
      total += numberOfDrinks * 5
    }

    // Add-on Kombucha (only for espresso packages)
    if (kombucha && kombuchaQuantity > 0 && (drinkPackage === 'standard' || drinkPackage === 'premium')) {
      total += 35 + (kombuchaQuantity * 6)
    }

    return total
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Send inquiry to Supabase

    // Show different message based on event type and payment method
    if (eventCategory === 'public') {
      alert('☕ Thank you for your inquiry!\n\nWe\'ll review your public event details and contact you within 24 hours.')
    } else if (eventCategory === 'private' && paymentMethod === 'guestpay') {
      alert('☕ Your estimate is brewing!\n\nSomeone from The Porch will contact you soon!')
    } else {
      alert(`Inquiry submitted! We'll contact you at ${email} within 24 hours.`)
    }
  }

  const totalEstimate = calculateTotal()

  return (
    <>
      {/* Google Maps API Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
      />

      <div className="min-h-screen bg-white py-12">
        <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/customer" className="text-sm text-gray-500 hover:text-black">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-serif text-black mt-4 mb-2">
              Event Inquiry
            </h1>
            <p className="text-gray-600">
              Complete the form below to request coffee cart service
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Section 0: Event Category */}
            <div className="border-t border-black/10 pt-8">
              <h2 className="text-2xl font-serif text-black mb-6">Event Category</h2>
              <div className="space-y-4">
              <label className="flex items-center border-2 border-gray-300 p-4 cursor-pointer hover:border-black transition-colors">
                <input
                  type="radio"
                  value="private"
                  checked={eventCategory === 'private'}
                  onChange={(e) => setEventCategory('private')}
                  className="mr-3"
                  required
                />
                <div>
                  <strong>Private Event</strong>
                  <p className="text-sm text-gray-600">
                    Wedding, party, corporate event, etc.
                  </p>
                </div>
              </label>

              <label className="flex items-center border-2 border-gray-300 p-4 cursor-pointer hover:border-black transition-colors">
                <input
                  type="radio"
                  value="public"
                  checked={eventCategory === 'public'}
                  onChange={(e) => setEventCategory('public')}
                  className="mr-3"
                  required
                />
                <div>
                  <strong>Public Event</strong>
                  <p className="text-sm text-gray-600">
                    Festival, fair, market, public gathering
                  </p>
                </div>
              </label>
            </div>

            {eventCategory === 'public' && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Estimated Number of People *
                </label>
                <input
                  type="number"
                  value={estimatedPeople}
                  onChange={(e) => setEstimatedPeople(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="e.g., 500"
                  required
                />
              </div>
            )}
          </div>

          {/* Section 1: Customer Information */}
          <div className="border-t border-black/10 pt-8">
            <h2 className="text-2xl font-serif text-black mb-6">Customer Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Event Type *
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  required
                >
                  <option value="">Select event type...</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Baby Shower">Baby Shower</option>
                  <option value="Bridal Shower">Bridal Shower</option>
                  <option value="Birthday Party">Birthday Party</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Graduation">Graduation</option>
                  <option value="Holiday Party">Holiday Party</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {eventType === 'Other' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    Please specify event type *
                  </label>
                  <input
                    type="text"
                    value={customEventType}
                    onChange={(e) => setCustomEventType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-2">
                  Event Address *
                </label>
                <input
                  ref={addressInputRef}
                  type="text"
                  value={eventAddress}
                  onChange={(e) => setEventAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="Start typing your address..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Event Details */}
          <div className="border-t border-black/10 pt-8">
            <h2 className="text-2xl font-serif text-black mb-6">Event Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Event Start Time *
                </label>
                <input
                  type="time"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Power Available *
                </label>
                <select
                  value={powerAvailable}
                  onChange={(e) => setPowerAvailable(e.target.value as 'yes' | 'no')}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  required
                >
                  <option value="">Select one...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {powerAvailable === 'yes' && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Distance from Power Source (feet) *
                  </label>
                  <input
                    type="number"
                    value={distanceFromPower}
                    onChange={(e) => setDistanceFromPower(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Indoor or Outdoor *
                </label>
                <select
                  value={indoorOutdoor}
                  onChange={(e) => setIndoorOutdoor(e.target.value as 'indoor' | 'outdoor')}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  required
                >
                  <option value="">Select one...</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Sink Available *
                </label>
                <select
                  value={sinkAvailable}
                  onChange={(e) => setSinkAvailable(e.target.value as 'yes' | 'no')}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  required
                >
                  <option value="">Select one...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Trash On Site *
                </label>
                <select
                  value={trashOnSite}
                  onChange={(e) => setTrashOnSite(e.target.value as 'yes' | 'no')}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  required
                >
                  <option value="">Select one...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Day-of Contact */}
          <div className="border-t border-black/10 pt-8">
            <h2 className="text-2xl font-serif text-black mb-6">Day-of Contact Person</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="Person we can reach during the event"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  required
                />
              </div>
            </div>
          </div>

          {/* Service Selection - PRIVATE EVENTS ONLY */}
          {eventCategory === 'private' && (
            <>
              <div className="border-t border-black/10 pt-8">
                <h2 className="text-2xl font-serif text-black mb-6">Service Selection</h2>

                {/* Payment Method */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-black mb-4">
                    Payment Method *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start border-2 border-gray-300 p-4 cursor-pointer hover:border-black transition-colors">
                      <input
                        type="radio"
                        value="openbar"
                        checked={paymentMethod === 'openbar'}
                        onChange={(e) => setPaymentMethod('openbar')}
                        className="mr-3 mt-1"
                        required
                      />
                      <div>
                        <strong>Open Bar</strong>
                        <p className="text-sm text-gray-600">Pre-paid, drinks free to guests</p>
                      </div>
                    </label>

                    <label className="flex items-start border-2 border-gray-300 p-4 cursor-pointer hover:border-black transition-colors">
                      <input
                        type="radio"
                        value="ticket"
                        checked={paymentMethod === 'ticket'}
                        onChange={(e) => setPaymentMethod('ticket')}
                        className="mr-3 mt-1"
                        required
                      />
                      <div>
                        <strong>Ticket System</strong>
                        <p className="text-sm text-gray-600">Free drink with ticket, guests pay without ticket</p>
                      </div>
                    </label>

                    <label className="flex items-start border-2 border-gray-300 p-4 cursor-pointer hover:border-black transition-colors">
                      <input
                        type="radio"
                        value="guestpay"
                        checked={paymentMethod === 'guestpay'}
                        onChange={(e) => setPaymentMethod('guestpay')}
                        className="mr-3 mt-1"
                        required
                      />
                      <div>
                        <strong>Guest Pay</strong>
                        <p className="text-sm text-gray-600">Guests pay for all drinks</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Guest Pay - Show estimated people only */}
                {paymentMethod === 'guestpay' && (
                  <div className="border-t border-black/10 pt-8">
                    <div className="mt-8">
                      <label className="block text-sm font-medium text-black mb-2">
                        Estimated Number of People Attending *
                      </label>
                      <input
                        type="number"
                        value={estimatedPeople}
                        onChange={(e) => setEstimatedPeople(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                        placeholder="e.g., 100"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Open Bar or Ticket System - Show full package options */}
                {(paymentMethod === 'openbar' || paymentMethod === 'ticket') && (
                  <>
                {/* Drink Package */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-black mb-4">
                    Select Drink Package *
                  </label>
                  <div className="space-y-4">
                    <label className="block border-2 border-gray-300 p-4 cursor-pointer hover:border-black transition-colors">
                      <input
                        type="radio"
                        value="drip"
                        checked={drinkPackage === 'drip'}
                        onChange={(e) => setDrinkPackage('drip')}
                        className="mr-3"
                        required
                      />
                      <strong>Drip Coffee Package</strong> - $5 per drink
                      <ul className="text-sm text-gray-600 ml-6 mt-2 list-disc">
                        <li>Includes 2 hours of service</li>
                        <li>Hot coffee</li>
                        <li>Creamer</li>
                        <li>Flavors: Caramel, Vanilla, White Chocolate, Brown Sugar</li>
                        <li>Cups, napkins, sugar, cream - everything needed to serve</li>
                      </ul>
                    </label>

                    <label className="block border-2 border-gray-300 p-4 cursor-pointer hover:border-black transition-colors">
                      <input
                        type="radio"
                        value="standard"
                        checked={drinkPackage === 'standard'}
                        onChange={(e) => setDrinkPackage('standard')}
                        className="mr-3"
                        required
                      />
                      <strong>Standard Espresso Package</strong> - $6 per drink
                      <ul className="text-sm text-gray-600 ml-6 mt-2 list-disc">
                        <li>Includes 2 hours of service</li>
                        <li>Espresso drinks (hot and cold)</li>
                        <li>Cold brew</li>
                        <li>Flavors: Caramel, Vanilla, White Chocolate, Brown Sugar</li>
                      </ul>
                    </label>

                    <label className="block border-2 border-gray-300 p-4 cursor-pointer hover:border-black transition-colors">
                      <input
                        type="radio"
                        value="premium"
                        checked={drinkPackage === 'premium'}
                        onChange={(e) => setDrinkPackage('premium')}
                        className="mr-3"
                        required
                      />
                      <strong>Premium Espresso Package</strong> - $7 per drink
                      <ul className="text-sm text-gray-600 ml-6 mt-2 list-disc">
                        <li>Includes 2 hours of service</li>
                        <li>Espresso drinks (hot and cold)</li>
                        <li>Cold brew</li>
                        <li>Cold foam option</li>
                        <li>Alternative milk options: Oat, Almond</li>
                        <li>Flavors: Caramel, Vanilla, White Chocolate, Brown Sugar + Specialty seasonal flavors</li>
                        <li>Matcha lattes</li>
                        <li>Chai tea lattes</li>
                      </ul>
                    </label>

                    <label className="block border-2 border-gray-300 p-4 cursor-pointer hover:border-black transition-colors">
                      <input
                        type="radio"
                        value="kombucha"
                        checked={drinkPackage === 'kombucha'}
                        onChange={(e) => setDrinkPackage('kombucha')}
                        className="mr-3"
                        required
                      />
                      <strong>Kombucha Bar Package</strong> - $6 per drink
                      <ul className="text-sm text-gray-600 ml-6 mt-2 list-disc">
                        <li>Includes 2 hours of service</li>
                        <li>Mobile Kombucha bar setup</li>
                        <li>Two different kombucha flavors</li>
                        <li>Flavors selected closer to event date</li>
                        <li>Cups, napkins, and everything needed to serve</li>
                      </ul>
                    </label>

                    <label className="block border-2 border-gray-300 p-4 cursor-pointer hover:border-black transition-colors">
                      <input
                        type="radio"
                        value="hotchoc"
                        checked={drinkPackage === 'hotchoc'}
                        onChange={(e) => setDrinkPackage('hotchoc')}
                        className="mr-3"
                        required
                      />
                      <strong>Hot Chocolate Bar Package</strong> - $5 per drink
                      <ul className="text-sm text-gray-600 ml-6 mt-2 list-disc">
                        <li>Includes 2 hours of service</li>
                        <li>Mobile Hot Chocolate bar setup</li>
                        <li>Rich hot chocolate</li>
                        <li>Whipped cream and toppings</li>
                        <li>Cups, napkins, and everything needed to serve</li>
                      </ul>
                    </label>
                  </div>
                </div>

                {/* Additional Hours */}
                <div className="mb-8">
                  <h3 className="text-xl font-serif text-black mb-6">Add Additional Hours</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your package includes 2 hours of service. Add more hours below:
                  </p>
                  <select
                    value={extraHours}
                    onChange={(e) => setExtraHours(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value={0}>2 hours (included)</option>
                    <option value={1}>3 hours total (+1 hour)</option>
                    <option value={2}>4 hours total (+2 hours)</option>
                    <option value={3}>5 hours total (+3 hours)</option>
                    <option value={4}>6 hours total (+4 hours)</option>
                    <option value={5}>7 hours total (+5 hours)</option>
                    <option value={6}>8 hours total (+6 hours)</option>
                  </select>
                </div>

                {/* Number of Drinks */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-black mb-2">
                    Number of Drinks (Minimum 25) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={numberOfDrinks}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      setNumberOfDrinks(value ? Number(value) : 25)
                    }}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Enter number of drinks"
                    required
                  />

                  {/* Discount Recommendations */}
                  {numberOfDrinks >= 25 && numberOfDrinks < 75 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200">
                      <p className="text-sm text-green-800">
                        💡 <strong>Discount available!</strong> Add {75 - numberOfDrinks} more drinks to unlock 25% off
                      </p>
                    </div>
                  )}
                  {numberOfDrinks >= 75 && numberOfDrinks < 100 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200">
                      <p className="text-sm text-green-800">
                        💡 <strong>Bigger discount available!</strong> Add {100 - numberOfDrinks} more drinks to unlock 50% off
                      </p>
                    </div>
                  )}
                  {numberOfDrinks >= 100 && numberOfDrinks < 200 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200">
                      <p className="text-sm text-green-800">
                        💡 <strong>Premium tier available!</strong> Add {200 - numberOfDrinks} more drinks to unlock FREE hours
                      </p>
                    </div>
                  )}
                  {numberOfDrinks >= 200 && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200">
                      <p className="text-sm text-purple-800">
                        🎉 <strong>Premium tier activated!</strong> You've unlocked our best pricing
                      </p>
                    </div>
                  )}
                </div>

                {/* Drink Limit Policy */}
                <div className="mb-8">
                  <h3 className="text-xl font-serif text-black mb-6">
                    What happens when drink limit is reached? *
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="stop"
                        checked={drinkLimit === 'stop'}
                        onChange={(e) => setDrinkLimit('stop')}
                        className="mr-3"
                        required
                      />
                      <strong>Stop serving</strong>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="contact"
                        checked={drinkLimit === 'contact'}
                        onChange={(e) => setDrinkLimit('contact')}
                        className="mr-3"
                        required
                      />
                      <strong>Contact day-of coordinator</strong>
                    </label>
                  </div>
                </div>

                {/* Add-ons - Only show for coffee packages, not standalone bars */}
                {(drinkPackage === 'drip' || drinkPackage === 'standard' || drinkPackage === 'premium') && (
                  <div className="border-t border-black/10 pt-8">
                    <h3 className="text-xl font-serif text-black mb-6">Add-ons</h3>

                    {/* Hot Chocolate - for drip and espresso packages */}
                    <div className="mb-6">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          checked={hotChocolate}
                          onChange={(e) => setHotChocolate(e.target.checked)}
                          className="mr-3 mt-1"
                        />
                        <div>
                          <strong>Hot Chocolate</strong>
                          {drinkPackage === 'drip' ? (
                            <p className="text-sm text-gray-600">+$25 (drip coffee package)</p>
                          ) : (
                            <p className="text-sm text-gray-600">Free with espresso packages</p>
                          )}
                        </div>
                      </label>
                    </div>

                    {/* Kombucha - only for espresso packages */}
                    {(drinkPackage === 'standard' || drinkPackage === 'premium') && (
                      <div className="mb-6">
                        <label className="flex items-start mb-3">
                          <input
                            type="checkbox"
                            checked={kombucha}
                            onChange={(e) => setKombucha(e.target.checked)}
                            className="mr-3 mt-1"
                          />
                          <div>
                            <strong>Kombucha Add-on</strong>
                            <p className="text-sm text-gray-600">$35 setup fee + $6 per drink</p>
                          </div>
                        </label>

                        {kombucha && (
                          <div className="ml-8">
                            <label className="block text-sm font-medium text-black mb-2">
                              Number of Kombucha Drinks *
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={kombuchaQuantity}
                              onChange={(e) => setKombuchaQuantity(Number(e.target.value))}
                              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                              required
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Price Estimate - Only show when package is selected */}
                {drinkPackage && (
                <div className="border-t border-black/10 pt-8">
                  <div className="bg-black/5 p-6">
                    <h3 className="text-2xl font-serif text-black mb-4">Estimated Cost</h3>
                    <div className="space-y-2 text-gray-700">
                      {pricing.tier === 4 ? (
                        <>
                          <div className="flex justify-between">
                            <span>Service hours ({pricing.totalHours} hours)</span>
                            <span>
                              {pricing.freeHours >= pricing.totalHours
                                ? 'FREE'
                                : `${pricing.totalHours - pricing.freeHours} × $${pricing.hourlyRate.toFixed(2)} = $${((pricing.totalHours - pricing.freeHours) * pricing.hourlyRate).toFixed(2)}`
                              }
                            </span>
                          </div>
                          {pricing.freeHours > 0 && (
                            <p className="text-sm text-green-600">
                              ({pricing.freeHours} hour{pricing.freeHours > 1 ? 's' : ''} FREE!)
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Base service (2 hours)</span>
                            <span>${pricing.baseFee.toFixed(2)}</span>
                          </div>

                          {extraHours > 0 && (
                            <div className="flex justify-between">
                              <span>Additional hours ({extraHours})</span>
                              <span>${(extraHours * pricing.hourlyRate).toFixed(2)}</span>
                            </div>
                          )}
                        </>
                      )}

                      {drinkPackage && (
                        <div className="flex justify-between">
                          <span>
                            {drinkPackage === 'drip' && 'Drip Coffee'}
                            {drinkPackage === 'standard' && 'Standard Espresso'}
                            {drinkPackage === 'premium' && 'Premium Espresso'}
                            {drinkPackage === 'kombucha' && 'Kombucha Bar'}
                            {drinkPackage === 'hotchoc' && 'Hot Chocolate Bar'}
                            {' '}({numberOfDrinks} drinks)
                          </span>
                          <span>
                            ${(numberOfDrinks * (
                              drinkPackage === 'drip' ? 5 :
                              drinkPackage === 'standard' ? 6 :
                              drinkPackage === 'premium' ? 7 :
                              drinkPackage === 'kombucha' ? 6 :
                              drinkPackage === 'hotchoc' ? 5 : 0
                            )).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {hotChocolate && drinkPackage === 'drip' && (
                        <div className="flex justify-between">
                          <span>Hot chocolate</span>
                          <span>$25.00</span>
                        </div>
                      )}

                      {kombucha && kombuchaQuantity > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span>Kombucha setup fee</span>
                            <span>$35.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Kombucha drinks ({kombuchaQuantity})</span>
                            <span>${(kombuchaQuantity * 6).toFixed(2)}</span>
                          </div>
                        </>
                      )}

                      <div className="border-t border-black/20 pt-2 mt-2">
                        <div className="flex justify-between text-xl font-bold text-black">
                          <span>Estimated Total</span>
                          <span>${totalEstimate.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-4">
                      This is an estimate. Final pricing will be confirmed in your invoice.
                    </p>
                  </div>
                </div>
                )}
                  </>
                )}
              </div>
            </>
          )}

          {/* Public Event Note */}
          {eventCategory === 'public' && (
            <div className="border-t border-black/10 pt-8">
              <div className="bg-blue-50 p-6 border border-blue-200">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Public Event Inquiry
                </h3>
                <p className="text-blue-700">
                  Thank you for your interest! We'll review your event details and contact you within 24 hours to discuss service options and pricing for your public event.
                </p>
              </div>
            </div>
          )}

          {/* Service Agreement - Only show for Private events with Open Bar or Ticket System */}
          {eventCategory === 'private' && paymentMethod !== 'guestpay' && (
          <div className="border-t border-black/10 pt-8">
            <h2 className="text-2xl font-serif text-black mb-6">Service Agreement</h2>

            <div className="bg-gray-50 p-6 border border-gray-300 max-h-96 overflow-y-auto text-sm space-y-4">
              <div>
                <h3 className="font-bold text-black mb-2">1. SERVICES PROVIDED</h3>
                <p className="text-gray-700">
                  Drink package as selected by client. Service duration is based on the hours selected or until the contracted number of drinks have been served, whichever occurs first. Service may end earlier if (A) the agreed number of drinks has been met, (B) the client declines additional drinks after exceeding requested amount, or (C) the client requests early closure. At such time, caterer will tear down and remove the coffee cart. No refunds will be issued if the allotted number of drinks is not reached within the allotted serve time. No additional serve time will be provided once the event contract has been finalized unless otherwise agreed upon by client to extend time.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-black mb-2">2. ADDITIONAL DRINKS</h3>
                <p className="text-gray-700">
                  Once the package allotment of drinks has been fulfilled, additional drinks may be served only if supplies permit. Extra drinks will be billed to the client at the agreed per-drink rate, and the client agrees to accept and pay all additional charges.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-black mb-2">3. WEATHER CONDITIONS & SETUP</h3>
                <p className="text-gray-700">
                  Coffee cart service is weather permitting. The client must provide a covered and dry area, away from water, mud, or any potential hazards that could cause damage to the equipment. If the client does not provide a suitable setup area, the caterer reserves the right to cancel services without refund for safety reasons.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-black mb-2">4. PAYMENT TERMS</h3>
                <p className="text-gray-700">
                  Payment will be invoiced after inquiry approval. No event will be considered fully booked until payment in full has been received.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-black mb-2">5. CANCELLATION POLICY</h3>
                <p className="text-gray-700">
                  If the client needs to cancel the event, client must provide written notice to caterer to effect cancellation. Client understands that upon entering into this contract, caterer is committing time and perishable resources to this event and thus cancellation would result in loss of income and business opportunities in an amount hard to precisely calculate.
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Cancellation terms:</strong>
                </p>
                <ul className="list-disc ml-6 text-gray-700 space-y-1">
                  <li>If client requests cancellation 30 days or more before the event start date/time, caterer shall refund 50% of the full payment.</li>
                  <li>If cancellation occurs within 30 days of the event, no payment will be returned to the client.</li>
                  <li>Caterer offers free rescheduling with a minimum of 7 days' notice before the event, subject to caterer's availability on the requested reschedule date.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-black mb-2">6. AGREEMENT</h3>
                <p className="text-gray-700">
                  By signing below, both parties agree to the terms outlined in this agreement.
                </p>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="mt-6">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mr-3 mt-1"
                  required
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the service agreement terms outlined above *
                </span>
              </label>
            </div>

            {/* Signature Section */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Digital Signature (Type your full name) *
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black font-serif text-lg"
                  placeholder="John Doe"
                  required
                  disabled={!agreedToTerms}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Type your name to serve as your digital signature
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={signatureDate}
                  onChange={(e) => setSignatureDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  required
                  disabled={!agreedToTerms}
                />
              </div>
            </div>
          </div>
          )}

            {/* Submit Button */}
            <div className="border-t border-black/10 pt-8">
              <button
                type="submit"
                disabled={eventCategory === 'private' && paymentMethod !== 'guestpay' && (!agreedToTerms || !signature)}
                className="w-full bg-black text-white py-4 px-6 text-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Submit Inquiry
              </button>
              <p className="text-center text-sm text-gray-600 mt-4">
                We'll review your inquiry and send you an invoice via Square within 24 hours
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
