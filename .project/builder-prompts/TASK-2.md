# TASK-2: Supabase Client/Server Helpers

## What You're Building
Two helper files that make it easy to connect to Supabase from browser code and server code. Plus a service-role client for API routes that bypasses RLS.

## Dependencies
- TASK-1 must be complete (real credentials in `.env.local`)
- Packages already installed: `@supabase/supabase-js`, `@supabase/ssr`

## Files to Create

### `lib/supabase/client.ts`
Browser-side Supabase client using `createBrowserClient` from `@supabase/ssr`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `lib/supabase/server.ts`
Server-side Supabase client for use in Server Components and API routes. Two exports:

1. `createServerSupabaseClient()` — uses cookies, for server components
2. `createServiceRoleClient()` — uses service role key, for API routes (bypasses RLS)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  )
}

export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

## Success Criteria
- Both files compile without errors
- `createServiceRoleClient()` can query `cc_bookings` (test with a simple select)
- Exports are clean and match what other tasks expect to import
