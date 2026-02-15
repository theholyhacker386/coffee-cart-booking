// Employee authentication utilities
// Handles PIN hashing, session tokens, and cookie management

const SALT = 'porch-coffee-cart'

export const EMPLOYEE_COOKIE_NAME = 'cc_employee_session'
export const INVITE_CODE = '7777'
export const ADMIN_INVITE_CODE = 'PorchAdmin2026'

// Hash a 4-digit PIN using SHA-256 with a salt
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(SALT + pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Verify a PIN against a stored hash
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  const pinHash = await hashPin(pin)
  return pinHash === hash
}

// Create a session token: base64-encoded JSON with id, name, role, and expiration
export function createSessionToken(id: string, name: string, role: string = 'employee'): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days from now
  const payload = JSON.stringify({ id, name, role, exp })
  // btoa works in Node 16+ and all modern browsers
  return btoa(payload)
}

// Decode and validate a session token
// Returns the payload if valid, null if expired or invalid
export function decodeSessionToken(token: string): { id: string; name: string; role: string; exp: number } | null {
  try {
    const payload = JSON.parse(atob(token))
    if (!payload.id || !payload.name || !payload.exp) {
      return null
    }
    if (Date.now() > payload.exp) {
      return null // expired
    }
    // Default role to 'employee' for tokens created before this update
    if (!payload.role) {
      payload.role = 'employee'
    }
    return payload
  } catch {
    return null
  }
}

// Cookie options for the employee session
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  path: '/',
}
