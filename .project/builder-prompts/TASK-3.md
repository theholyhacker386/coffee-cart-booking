# TASK-3: Wire Booking Form to Supabase + Checklist Generator

## What You're Building
Two things:
1. Modify the email API route to ALSO save bookings to Supabase and generate checklist items
2. Build the checklist generator that creates the correct items based on the customer's booking

## Dependencies
- TASK-2 must be complete (Supabase helpers exist)

## Files to Modify

### `app/api/send-email/route.ts`
After the existing email/SMS sending logic succeeds, add code to:
1. Import `createServiceRoleClient` from `lib/supabase/server`
2. Import `generateChecklist` from `lib/checklist-generator`
3. Insert booking data into `cc_bookings` (map form fields to column names)
4. Call `generateChecklist(bookingData)` to get checklist items
5. Insert all checklist items into `cc_checklist_items` with the booking's ID

**IMPORTANT:** Do NOT break the existing email/SMS flow. The Supabase save should happen AFTER emails succeed. If the database save fails, still return success (the emails went out — that's what matters). Log the error.

**Field mapping from form → database:**
- `customerName` → `customer_name`
- `eventDate` → `event_date`
- `eventStartTime` → `event_start_time`
- `eventAddress` → `event_address`
- `eventType` → `event_type`
- `customEventType` → `custom_event_type`
- `eventCategory` → `event_category`
- `indoorOutdoor` → `indoor_outdoor`
- `powerAvailable` → `power_available`
- `distanceFromPower` → `distance_from_power`
- `sinkAvailable` → `sink_available`
- `trashOnSite` → `trash_on_site`
- `contactName` → `contact_name`
- `contactPhone` → `contact_phone`
- `paymentMethod` → `payment_method`
- `drinkPackage` → `drink_package`
- `numberOfDrinks` → `number_of_drinks`
- `drinkLimit` → `drink_limit`
- `extraHours` → `extra_hours`
- `hotChocolate` → `hot_chocolate_addon`
- `kombucha` → `kombucha_addon`
- `travelDistanceMiles` → `travel_distance_miles`
- `travelDriveMinutes` → `travel_drive_minutes`
- `travelFee` → `travel_fee`
- `totalEstimate` → `total_estimate`
- `estimatedPeople` → `estimated_people`
- `howHeardAboutUs` → `how_heard_about_us`
- `additionalDetails` → `additional_details`
- `signature` → `signature`

## Files to Create

### `lib/checklist-generator.ts`

Export a function `generateChecklist(booking)` that returns an array of checklist items.

Each item has: `{ item_text, category, phase, sort_order }`

**Phase:** `"day_before"` or `"day_of"`

#### Day-Of Universal Items (EVERY event):
Category: "loading"
1. Load cart into vehicle
2. Pack folding table and tablecloth
3. Pack menu signage/display
4. Pack tip jar
5. Pack trash bags

Category: "planning"
6. Check weather forecast for [event_date]
7. Confirm day-of contact: [contact_name] at [contact_phone]
8. Plan route — [travel_distance_miles] miles, ~[travel_drive_minutes] min drive

#### Day-Of Package-Specific Items:

**Drip Coffee** (`drink_package === 'drip'`):
Category: "equipment"
- Grind coffee beans (amount based on [number_of_drinks] drinks)
- Fill hot water dispensers
- Pack coffee brewers and airpots
- Pack creamer (regular + flavored)
- Pack flavor syrups: Caramel, Vanilla, White Chocolate, Brown Sugar
- Pack cups, lids, napkins, stir sticks, sugar/sweeteners

**Standard Espresso** (`drink_package === 'standard'`):
Category: "equipment"
- Pack espresso machine + grinder
- Pack espresso beans (amount based on [number_of_drinks] drinks)
- Pack whole milk
- Pack cold brew concentrate + dispenser
- Pack flavor syrups
- Pack ice for cold drinks
- Pack milk frothing pitchers
- Pack hot cups + cold cups + straws + lids + napkins

**Premium Espresso** (`drink_package === 'premium'`) — everything from Standard PLUS:
Category: "equipment"
- All Standard Espresso items
- Pack oat milk and almond milk
- Pack cold foam pitcher
- Pack matcha powder
- Pack chai concentrate
- Pack seasonal specialty syrups

**Kombucha Bar** (`drink_package === 'kombucha'`):
Category: "equipment"
- Pack kombucha kegs (2 flavors)
- Pack kombucha tap system + drip trays
- Pack cups + napkins

**Hot Chocolate Bar** (`drink_package === 'hotchoc'`):
Category: "equipment"
- Pack hot chocolate mix
- Pack whole milk
- Pack whipped cream cans
- Pack toppings: marshmallows, chocolate shavings, cinnamon
- Pack hot chocolate dispenser/warmers
- Pack cups + napkins

#### Day-Of Venue-Specific Items:
Category: "venue"
- `power_available === 'no'` → Pack generator + fuel
- `power_available === 'yes'` → Pack extension cord ([distance_from_power] ft needed)
- `sink_available === 'no'` → Pack water jugs (5 gal x2) and waste water bucket
- `trash_on_site === 'no'` → Pack extra trash bags
- `indoor_outdoor === 'outdoor'` → Pack canopy/tent + weights

#### Day-Of Payment Method Items:
Category: "payment"
- `payment_method === 'openbar'` → Pack drink counter/tracker for [number_of_drinks] pre-paid drinks
- `payment_method === 'ticket'` → Pack ticket collection box + drink tickets
- `payment_method === 'guestpay'` → Pack payment terminal/Square reader + price signage

#### Day-Of Add-on Items:
Category: "addons"
- `hot_chocolate_addon === true` → Pack hot chocolate mix, whipped cream, toppings
- `kombucha_addon === true` → Pack kombucha keg (1 flavor) + tap + cups

#### Day-Before Universal Items:
Category: "supplies"
Phase: "day_before"
1. Check supplies box: cups, napkins, straws, lids stocked
2. Check flavor syrups: Caramel, Vanilla, White Chocolate, Brown Sugar
3. Check sugar packets and sweeteners
4. Fill water jugs and have ready
5. Check extension cords are working
6. Confirm event details haven't changed

#### Day-Before Package-Specific Items:

**Drip Coffee:**
Category: "prep", Phase: "day_before"
- Is there enough ground coffee? (or beans to grind)
- Check creamer supply (regular + flavored)
- Clean and test coffee brewers
- Check airpots are clean and working

**Standard Espresso:**
Category: "prep", Phase: "day_before"
- Check espresso beans supply
- Is cold brew brewed and ready?
- Is milk ordered/stocked? (whole milk)
- Check ice supply or plan ice run
- Clean espresso machine
- Clean milk frothing pitchers

**Premium Espresso** (everything from Standard PLUS):
Category: "prep", Phase: "day_before"
- All Standard Espresso day-before items
- Is oat milk and almond milk stocked?
- Check matcha powder supply
- Check chai concentrate supply
- Check cold foam pitcher and charger
- Check seasonal specialty syrups

**Kombucha Bar:**
Category: "prep", Phase: "day_before"
- Are kombucha kegs ready? (2 flavors)
- Check kombucha tap system is clean and working
- Confirm flavors for the event

**Hot Chocolate Bar:**
Category: "prep", Phase: "day_before"
- Check hot chocolate mix supply
- Is milk ordered/stocked?
- Check whipped cream cans
- Check toppings: marshmallows, chocolate shavings, cinnamon
- Clean hot chocolate dispenser/warmers

**Add-on day-before items:**
- `hot_chocolate_addon` → Check hot chocolate supplies
- `kombucha_addon` → Check kombucha keg (1 flavor) ready

#### Public Event Fallback:
When `event_category === 'public'`, skip package-specific items and generate:
Category: "general"
- Load cart with full beverage equipment
- Pack full supply kit (cups, lids, napkins, straws)
- Pack all available syrups and toppings
- Pack payment terminal/Square reader + price signage
- Pack menu signage with pricing
- Pack canopy/tent + weights (outdoor assumed)
- Confirm service details with Jennifer before event

Day-before for public:
- Check all equipment is clean and working
- Stock full supply inventory
- Confirm event details with Jennifer

## Success Criteria
- Submitting the booking form saves data to `cc_bookings`
- Checklist items are generated and saved to `cc_checklist_items`
- Existing email/SMS flow still works unchanged
- Dynamic values (customer name, phone, miles, etc.) are interpolated into item text
- Public events get the fallback checklist
