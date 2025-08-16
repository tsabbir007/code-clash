import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Check if DATABASE_URL is available
let db: any = null;
let dbError: string | null = null;

try {
    if (!process.env.DATABASE_URL) {
        dbError = "DATABASE_URL environment variable is not set";
        console.error('❌ Database configuration error:', dbError);
        console.error('💡 Please add DATABASE_URL to your .env.local file and restart the server');
    } else {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            // Add connection timeout and retry options
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 30000,
            max: 20,
        });

        // Test the database connection
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            dbError = `Database connection error: ${err.message}`;
        });

        db = drizzle(pool, { schema });
        console.log('✅ Database connection initialized successfully');
    }
} catch (error) {
    dbError = error instanceof Error ? error.message : 'Unknown database error';
    console.error('❌ Failed to initialize database:', dbError);
}

export { db, dbError };

// npx drizzle-kit generate - generate migrations
// npx drizzle-kit migrate  - run migrations
// npx drizzle-kit push     - push changes to the database
// npx drizzle-kit studio   - open the studio