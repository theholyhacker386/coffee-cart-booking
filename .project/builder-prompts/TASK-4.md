# TASK-4: Employee Auth (Sign-up + PIN Login)

## What You're Building
A simple auth system where employees create an account (name + 4-digit PIN + invite code) and log in with their name + PIN via a number pad. Session persists for 7 days via a cookie.

## Dependencies
- TASK-2 must be complete (Supabase helpers)

## Files to Create

### `lib/employee-auth.ts`
Utility functions for employee authentication:

```typescript
// Hash a PIN using Web Crypto API (SHA-256 with salt)
export async function hashPin(pin: string): Promise<string>

// Verify a PIN against a hash
export async function verifyPin(pin: string, hash: string): Promise<boolean>

// Set employee session cookie (7 days, httpOnly, secure, sameSite: lax)
export function setEmployeeCookie(employeeId: string, employeeName: string): cookie config

// Read employee session from cookie
export function getEmployeeFromCookie(cookieValue: string): { id: string, name: string } | null

// Cookie name constant
export const EMPLOYEE_COOKIE_NAME = 'cc_employee_session'
```

Use a simple approach: store `JSON.stringify({ id, name, exp })` as the cookie value, signed/encoded with a secret. Or use a simple JWT-like approach with `crypto.subtle`. Keep it simple — this is for 2 employees, not a banking app.

The invite code is: `PorchCrew2026` (hardcoded constant — Jennifer can change it later).

### `app/api/employee/signup/route.ts`
POST endpoint:
- Receives: `{ name, pin, inviteCode }`
- Validates invite code === "PorchCrew2026"
- Validates PIN is exactly 4 digits
- Validates name is not empty
- Checks no existing employee with same name (case-insensitive)
- Hashes PIN
- Inserts into `cc_employees`
- Sets session cookie
- Returns `{ success: true, employee: { id, name } }`

### `app/api/employee/login/route.ts`
POST endpoint:
- Receives: `{ name, pin }`
- Looks up employee by name (case-insensitive)
- Verifies PIN against stored hash
- Sets session cookie (7 days)
- Returns `{ success: true, employee: { id, name } }`
- Returns 401 if name not found or PIN wrong (generic error: "Invalid name or PIN")

### `app/api/employee/logout/route.ts`
POST endpoint:
- Clears the session cookie
- Returns `{ success: true }`

### `middleware.ts`
Next.js middleware that:
- Only runs on paths matching `/employee/dashboard` and `/employee/event/:path*`
- Checks for valid employee session cookie
- If no valid cookie → redirect to `/employee`
- If valid cookie → continue
- Does NOT run on `/employee` (the login page itself)

### `components/PinPad.tsx`
A number pad component:
- 3×4 grid: digits 1-9, then [clear] [0] [submit]
- Shows dots (●●●●) for entered digits (like a phone PIN screen)
- Max 4 digits
- Calls `onSubmit(pin: string)` when submit is tapped
- Mobile-friendly: large tap targets (min 48px)
- Styled to match the app's black/white/amber theme

### `app/employee/page.tsx`
The login/sign-up page:
- Toggle between "Sign In" and "Create Account" modes
- **Sign In mode:**
  - Name input field (text)
  - PinPad component
  - "Sign In" submits to `/api/employee/login`
  - On success → redirect to `/employee/dashboard`
- **Create Account mode:**
  - Name input field
  - Invite code input field
  - PinPad component
  - "Create Account" submits to `/api/employee/signup`
  - On success → redirect to `/employee/dashboard`
- Show error messages inline (wrong PIN, invalid invite code, etc.)
- The Porch Coffee Bar logo at top

### `app/employee/layout.tsx`
Layout wrapper for all employee pages:
- Simple header with "The Porch" branding and employee name
- Logout button in header
- Clean, minimal design
- Uses the same font/color scheme as the rest of the app

## Design Notes
- The PIN pad should feel like unlocking a phone — clean, centered, large buttons
- Use the existing color scheme (black, white, amber accents from the customer side)
- The logo is at `/public/the porch coffe bar logo.png`
- Mobile-first design — employees will use this on their phones

## Success Criteria
- Can create a new employee account with name + PIN + invite code
- Wrong invite code is rejected
- Can log in with name + PIN
- Wrong PIN shows error
- Session persists (refresh page → still logged in)
- `/employee/dashboard` redirects to `/employee` when not logged in
- Logout clears session
