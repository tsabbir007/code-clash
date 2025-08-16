import { createAuthClient } from "better-auth/react"

// Create auth client without any server-side dependencies
// The auth client will communicate with the API routes instead
export const authClient = createAuthClient()