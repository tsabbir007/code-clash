import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schema";
import { db } from "@/db";

export const auth = betterAuth({
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