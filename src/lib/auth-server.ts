import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schema";
import { db, dbError } from "@/db";

// Check environment variables and provide helpful error messages
function validateEnvironment() {
    const missingVars = [];

    if (!process.env.BETTER_AUTH_SECRET) {
        missingVars.push('BETTER_AUTH_SECRET');
    }

    if (!process.env.DATABASE_URL) {
        missingVars.push('DATABASE_URL');
    }

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars.join(', '));
        console.error('💡 Please create a .env.local file in your project root with:');
        console.error('   DATABASE_URL="postgresql://username:password@localhost:5432/database"');
        console.error('   BETTER_AUTH_SECRET="your-secret-key"');
        console.error('   Then restart your development server.');

        // Return false instead of throwing error
        return false;
    }

    return true;
}

// Try to create auth configuration, fallback gracefully if it fails
let auth: any = null;
let authError: string | null = null;

try {
    if (validateEnvironment()) {
        if (dbError) {
            authError = `Database connection failed: ${dbError}`;
            console.error('❌ Cannot initialize auth due to database error:', dbError);
        } else if (!db) {
            authError = "Database not available";
            console.error('❌ Cannot initialize auth: database not available');
        } else {
            auth = betterAuth({
                secret: process.env.BETTER_AUTH_SECRET!,
                ipAddress: {
                    ipAddressHeaders: ["x-client-ip", "x-forwarded-for", "x-real-ip"],
                    disableIpTracking: false
                },
                database: drizzleAdapter(db, {
                    provider: "pg",
                    schema: {
                        ...schema
                    }
                }),
                emailAndPassword: {
                    enabled: true
                },
            });
            console.log('✅ Authentication system initialized successfully');
        }
    } else {
        authError = "Environment variables not configured";
    }
} catch (error) {
    console.error('❌ Failed to initialize auth:', error);
    authError = error instanceof Error ? error.message : 'Unknown error';
}

export { auth, authError };
