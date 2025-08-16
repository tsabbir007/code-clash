// This file is kept for backward compatibility but should not be imported on the client side
// Use auth-server.ts for server-side imports and auth-client.ts for client-side usage

import { betterAuth } from "better-auth";

// Validate required environment variables
if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
}

// Note: This export should only be used on the server side
// For client-side usage, use the authClient from auth-client.ts
export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: {
        enabled: true
    },
    // Database configuration moved to auth-server.ts to avoid client-side bundling
});