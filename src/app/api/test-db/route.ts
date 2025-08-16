import { NextRequest, NextResponse } from 'next/server';
import { db, dbError } from '@/db';
import { contest } from '@/db/schema';
import { count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        // Check if database is available
        if (dbError) {
            return NextResponse.json({
                success: false,
                error: 'Database not configured',
                details: dbError
            }, { status: 503 });
        }

        if (!db) {
            return NextResponse.json({
                success: false,
                error: 'Database connection not initialized'
            }, { status: 503 });
        }

        // Try to query the contest table
        const [contestCount] = await db
            .select({ count: count() })
            .from(contest);

        return NextResponse.json({
            success: true,
            message: 'Database connection working',
            contestCount: contestCount?.count || 0,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Database test error:', error);
        return NextResponse.json({
            success: false,
            error: 'Database query failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
