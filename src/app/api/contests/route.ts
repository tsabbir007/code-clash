import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contest } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        // Fetch all contests ordered by start time (newest first)
        const contests = await db
            .select({
                id: contest.id,
                title: contest.title,
                description: contest.description,
                startTime: contest.startTime,
                endTime: contest.endTime,
            })
            .from(contest)
            .orderBy(desc(contest.startTime));

        return NextResponse.json({
            success: true,
            data: contests
        });

    } catch (error) {
        console.error('Error fetching contests:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch contests' },
            { status: 500 }
        );
    }
}
