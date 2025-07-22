// Make sure to install the 'pg' package 
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export { db };

// npx drizzle-kit generate - generate migrations
// npx drizzle-kit migrate  - run migrations
// npx drizzle-kit push     - push changes to the database
// npx drizzle-kit studio   - open the studio
// npx drizzle-kit pull     - pull changes from the database