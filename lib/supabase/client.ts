
import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export const createClient = () => {
    if (client) return client

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                name: 'boli-auth-token',
                secure: false, // Required for http://localhost
                sameSite: 'lax',
                path: '/',
            }
        }
    )
    return client
}
