// Checklist generator for The Porch Coffee Cart
// Creates a list of items to pack, prep, and handle for each event booking

export interface BookingData {
  customer_name?: string
  event_date?: string
  event_start_time?: string
  event_address?: string
  event_type?: string
  custom_event_type?: string
  event_category?: string
  indoor_outdoor?: string
  power_available?: string
  distance_from_power?: string
  sink_available?: string
  trash_on_site?: string
  contact_name?: string
  contact_phone?: string
  payment_method?: string
  drink_package?: string
  number_of_drinks?: number
  drink_limit?: string
  extra_hours?: number
  hot_chocolate_addon?: boolean
  kombucha_addon?: boolean
  travel_distance_miles?: number
  travel_drive_minutes?: number
  travel_fee?: number
  total_estimate?: number
  estimated_people?: string
  additional_details?: string
}

export interface ChecklistItem {
  item_text: string
  category: string
  phase: 'day_before' | 'day_of' | 'restock'
  sort_order: number
}

// Drink recipes reference — displayed on event page, not in checklist
export const DRINK_RECIPES = {
  matcha: '2 oz matcha',
  coffee16: '16oz coffee: 3oz cold brew',
  coffee20: '20oz coffee: 4oz cold brew',
  coldBrew16: '16oz cold brew: 4oz cold brew + water',
}

function formatEventDate(dateStr?: string): string {
  if (!dateStr) return 'TBD'
  try {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function hasSprinkles(booking: BookingData): boolean {
  if (!booking.additional_details) return false
  return booking.additional_details.toLowerCase().includes('sprinkle')
}

export function generateChecklist(booking: BookingData): ChecklistItem[] {
  const items: ChecklistItem[] = []

  // Determine if this is a public event
  const isPublic = booking.event_category === 'public'

  if (isPublic) {
    return generatePublicEventChecklist(booking)
  }

  return generatePrivateEventChecklist(booking)
}

function generatePublicEventChecklist(booking: BookingData): ChecklistItem[] {
  const items: ChecklistItem[] = []
  let dayOfOrder = 0
  let dayBeforeOrder = 0
  let restockOrder = 0

  // ── DAY-OF: Every event essentials ──
  const essentials = [
    'Cart',
    'Scale',
    'Coffee beans',
    'Ice',
    '2 Whole milk',
    'Caramel Sauce',
    'Syrups — Vanilla, Brown Sugar, White Mocha, Caramel, Raspberry',
    '12oz hot cups',
    '16oz plastic cups',
    '20oz plastic cups',
    'Sip lids',
    'Hot cup lids',
    '3 Towels',
    'Straws',
    'Money',
    'Porch stickers',
    '2 Water jugs',
    'Extension cord',
    'Sugars',
    'Napkins',
    'Muffins',
    'Trash bag',
    'COLD BREW container',
  ]

  for (const text of essentials) {
    dayOfOrder++
    items.push({ item_text: text, category: 'essentials', phase: 'day_of', sort_order: dayOfOrder })
  }

  // Espresso items (assume full setup for public)
  const espressoItems = [
    'Espresso machine',
    '2 espresso glass cups',
    '2 milk steamer cups',
    'Frother stick',
    'Chai concentrate',
    '2 Oat milk',
    '2 Almond milk',
  ]
  for (const text of espressoItems) {
    dayOfOrder++
    items.push({ item_text: text, category: 'espresso', phase: 'day_of', sort_order: dayOfOrder })
  }

  // Venue-specific items
  if (booking.power_available === 'no') {
    dayOfOrder++
    items.push({ item_text: 'Generator + fuel', category: 'venue', phase: 'day_of', sort_order: dayOfOrder })
  }
  if (booking.indoor_outdoor === 'outdoor') {
    dayOfOrder++
    items.push({ item_text: 'Canopy/tent + weights', category: 'venue', phase: 'day_of', sort_order: dayOfOrder })
  }
  if (booking.sink_available === 'no') {
    dayOfOrder++
    items.push({ item_text: 'Extra water containers', category: 'venue', phase: 'day_of', sort_order: dayOfOrder })
  }
  if (booking.trash_on_site === 'no') {
    dayOfOrder++
    items.push({ item_text: 'Extra trash bags', category: 'venue', phase: 'day_of', sort_order: dayOfOrder })
  }

  // Payment (assume guest pay for public)
  dayOfOrder++
  items.push({ item_text: 'Square reader + price signage', category: 'payment', phase: 'day_of', sort_order: dayOfOrder })

  // Planning
  dayOfOrder++
  items.push({
    item_text: `Check weather forecast for ${formatEventDate(booking.event_date)}`,
    category: 'planning',
    phase: 'day_of',
    sort_order: dayOfOrder,
  })
  if (booking.contact_name || booking.contact_phone) {
    dayOfOrder++
    items.push({
      item_text: `Confirm day-of contact: ${booking.contact_name || 'N/A'} at ${booking.contact_phone || 'N/A'}`,
      category: 'planning',
      phase: 'day_of',
      sort_order: dayOfOrder,
    })
  }
  if (booking.travel_distance_miles || booking.travel_drive_minutes) {
    dayOfOrder++
    items.push({
      item_text: `Plan route — ${booking.travel_distance_miles ?? '?'} miles, ~${booking.travel_drive_minutes ?? '?'} min drive`,
      category: 'planning',
      phase: 'day_of',
      sort_order: dayOfOrder,
    })
  }

  // Special public event item
  dayOfOrder++
  items.push({
    item_text: 'Confirm service details with Jennifer before event',
    category: 'planning',
    phase: 'day_of',
    sort_order: dayOfOrder,
  })

  // ── DAY-BEFORE: Prep ──
  const dayBeforeUniversal = [
    'Call the shop to check if coffee cart prep list is ready',
    'Confirm event details haven\'t changed',
    'Check supplies: cups, lids, napkins, straws stocked',
    'Check flavor syrups are stocked',
    'Check sugar packets and sweeteners',
    'Fill water jugs and have ready',
    'Check extension cord is working',
  ]
  for (const text of dayBeforeUniversal) {
    dayBeforeOrder++
    items.push({ item_text: text, category: 'prep', phase: 'day_before', sort_order: dayBeforeOrder })
  }

  // Full espresso prep for public events
  const standardEspressoPrep = [
    'Check espresso beans supply',
    'Is cold brew brewed and ready?',
    'Check milk supply (whole milk)',
    'Check ice supply or plan ice run',
    'Clean espresso machine',
    'Clean milk frothing pitchers',
  ]
  for (const text of standardEspressoPrep) {
    dayBeforeOrder++
    items.push({ item_text: text, category: 'prep', phase: 'day_before', sort_order: dayBeforeOrder })
  }

  // ── RESTOCK: Every event ──
  const restockItems = [
    'Restock cups, lids, napkins, straws',
    'Restock syrups as needed',
    'Restock sugars and sweeteners',
    'Clean and put away all equipment',
    'Restock milk supply',
  ]
  for (const text of restockItems) {
    restockOrder++
    items.push({ item_text: text, category: 'restock', phase: 'restock', sort_order: restockOrder })
  }

  return items
}

function generatePrivateEventChecklist(booking: BookingData): ChecklistItem[] {
  const items: ChecklistItem[] = []
  let dayOfOrder = 0
  let dayBeforeOrder = 0
  let restockOrder = 0

  const pkg = booking.drink_package

  // ── DAY-OF: Every event essentials ──
  const essentials = [
    'Cart',
    'Scale',
    'Coffee beans',
    'Ice',
    '2 Whole milk',
    'Caramel Sauce',
    'Syrups — Vanilla, Brown Sugar, White Mocha, Caramel, Raspberry',
    '12oz hot cups',
    '16oz plastic cups',
    '20oz plastic cups',
    'Sip lids',
    'Hot cup lids',
    '3 Towels',
    'Straws',
    'Money',
    'Porch stickers',
    '2 Water jugs',
    'Extension cord',
    'Sugars',
    'Napkins',
    'Muffins',
    'Trash bag',
    'COLD BREW container',
  ]

  for (const text of essentials) {
    dayOfOrder++
    items.push({ item_text: text, category: 'essentials', phase: 'day_of', sort_order: dayOfOrder })
  }

  // ── DAY-OF: Package-specific items ──

  // Standard Espresso OR Premium Espresso
  if (pkg === 'standard' || pkg === 'premium') {
    const espressoItems = [
      'Espresso machine',
      '2 espresso glass cups',
      '2 milk steamer cups',
      'Frother stick',
      'Chai concentrate',
      '2 Oat milk',
      '2 Almond milk',
    ]
    for (const text of espressoItems) {
      dayOfOrder++
      items.push({ item_text: text, category: 'espresso', phase: 'day_of', sort_order: dayOfOrder })
    }
  }

  // Premium Espresso ONLY — additional items on top of standard
  if (pkg === 'premium') {
    const premiumItems = [
      'Cold foam',
      '2 measuring cups for cold foam (oz)',
      'Matcha',
      'Seasonal syrup',
    ]
    for (const text of premiumItems) {
      dayOfOrder++
      items.push({ item_text: text, category: 'premium', phase: 'day_of', sort_order: dayOfOrder })
    }
  }

  // Drip Coffee package
  if (pkg === 'drip') {
    dayOfOrder++
    items.push({ item_text: 'Drip coffee brewer', category: 'drip', phase: 'day_of', sort_order: dayOfOrder })
  }

  // Sprinkles check
  if (hasSprinkles(booking)) {
    dayOfOrder++
    items.push({ item_text: 'Sprinkles', category: 'essentials', phase: 'day_of', sort_order: dayOfOrder })
  }

  // ── DAY-OF: Venue-specific items ──
  if (booking.power_available === 'no') {
    dayOfOrder++
    items.push({ item_text: 'Generator + fuel', category: 'venue', phase: 'day_of', sort_order: dayOfOrder })
  }
  if (booking.indoor_outdoor === 'outdoor') {
    dayOfOrder++
    items.push({ item_text: 'Canopy/tent + weights', category: 'venue', phase: 'day_of', sort_order: dayOfOrder })
  }
  if (booking.sink_available === 'no') {
    dayOfOrder++
    items.push({ item_text: 'Extra water containers', category: 'venue', phase: 'day_of', sort_order: dayOfOrder })
  }
  if (booking.trash_on_site === 'no') {
    dayOfOrder++
    items.push({ item_text: 'Extra trash bags', category: 'venue', phase: 'day_of', sort_order: dayOfOrder })
  }

  // ── DAY-OF: Payment method items ──
  if (booking.payment_method === 'openbar') {
    dayOfOrder++
    items.push({
      item_text: `Drink counter/tracker for ${booking.number_of_drinks ?? '?'} pre-paid drinks`,
      category: 'payment',
      phase: 'day_of',
      sort_order: dayOfOrder,
    })
  }
  if (booking.payment_method === 'ticket') {
    dayOfOrder++
    items.push({ item_text: 'Ticket collection box + drink tickets', category: 'payment', phase: 'day_of', sort_order: dayOfOrder })
  }
  if (booking.payment_method === 'guestpay') {
    dayOfOrder++
    items.push({ item_text: 'Square reader + price signage', category: 'payment', phase: 'day_of', sort_order: dayOfOrder })
  }

  // ── DAY-OF: Planning items ──
  dayOfOrder++
  items.push({
    item_text: `Check weather forecast for ${formatEventDate(booking.event_date)}`,
    category: 'planning',
    phase: 'day_of',
    sort_order: dayOfOrder,
  })
  if (booking.contact_name || booking.contact_phone) {
    dayOfOrder++
    items.push({
      item_text: `Confirm day-of contact: ${booking.contact_name || 'N/A'} at ${booking.contact_phone || 'N/A'}`,
      category: 'planning',
      phase: 'day_of',
      sort_order: dayOfOrder,
    })
  }
  if (booking.travel_distance_miles || booking.travel_drive_minutes) {
    dayOfOrder++
    items.push({
      item_text: `Plan route — ${booking.travel_distance_miles ?? '?'} miles, ~${booking.travel_drive_minutes ?? '?'} min drive`,
      category: 'planning',
      phase: 'day_of',
      sort_order: dayOfOrder,
    })
  }

  // ── DAY-BEFORE: Universal prep ──
  const dayBeforeUniversal = [
    'Call the shop to check if coffee cart prep list is ready',
    'Confirm event details haven\'t changed',
    'Check supplies: cups, lids, napkins, straws stocked',
    'Check flavor syrups are stocked',
    'Check sugar packets and sweeteners',
    'Fill water jugs and have ready',
    'Check extension cord is working',
  ]
  for (const text of dayBeforeUniversal) {
    dayBeforeOrder++
    items.push({ item_text: text, category: 'prep', phase: 'day_before', sort_order: dayBeforeOrder })
  }

  // ── DAY-BEFORE: Package-specific prep ──

  // Drip Coffee day-before
  if (pkg === 'drip') {
    const dripPrep = [
      'Check ground coffee supply (or beans to grind)',
      'Clean and test coffee brewers',
    ]
    for (const text of dripPrep) {
      dayBeforeOrder++
      items.push({ item_text: text, category: 'prep', phase: 'day_before', sort_order: dayBeforeOrder })
    }
  }

  // Standard Espresso day-before
  if (pkg === 'standard' || pkg === 'premium') {
    const standardPrep = [
      'Check espresso beans supply',
      'Is cold brew brewed and ready?',
      'Check milk supply (whole milk)',
      'Check ice supply or plan ice run',
      'Clean espresso machine',
      'Clean milk frothing pitchers',
    ]
    for (const text of standardPrep) {
      dayBeforeOrder++
      items.push({ item_text: text, category: 'prep', phase: 'day_before', sort_order: dayBeforeOrder })
    }
  }

  // Premium Espresso day-before — additional on top of standard
  if (pkg === 'premium') {
    const premiumPrep = [
      'Check oat milk and almond milk stocked',
      'Check matcha powder supply',
      'Check chai concentrate supply',
      'Check cold foam supplies',
    ]
    for (const text of premiumPrep) {
      dayBeforeOrder++
      items.push({ item_text: text, category: 'prep', phase: 'day_before', sort_order: dayBeforeOrder })
    }
  }

  // ── RESTOCK: Every event ──
  const restockItems = [
    'Restock cups, lids, napkins, straws',
    'Restock syrups as needed',
    'Restock sugars and sweeteners',
    'Clean and put away all equipment',
    'Restock milk supply',
  ]
  for (const text of restockItems) {
    restockOrder++
    items.push({ item_text: text, category: 'restock', phase: 'restock', sort_order: restockOrder })
  }

  return items
}
