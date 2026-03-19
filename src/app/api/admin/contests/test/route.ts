import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contest } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        // Test database connection by fetching all contests
        const contests = await db
            .select()
            .from(contest)
            .limit(10);

        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            contests: contests,
            total: contests.length
        });

    } catch (error) {
        console.error('Database connection test failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Database connection failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
