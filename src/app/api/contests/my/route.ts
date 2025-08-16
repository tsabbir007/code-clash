import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';
import { db } from '@/db';
import { contest, contestParticipant } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        // Check if auth is properly configured
        if (!auth) {
            console.error('Auth not configured');
            return NextResponse.json({
                success: false,
                error: 'Authentication not configured'
            }, { status: 503 });
        }

        // Get the current session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const currentUserId = session?.user?.id;

        // Fetch contests where the user is a participant
        const userContests = await db
            .select({
                id: contest.id,
                title: contest.title,
                description: contest.description,
                startTime: contest.startTime,
                endTime: contest.endTime,
            })
            .from(contest)
            .innerJoin(contestParticipant, eq(contest.id, contestParticipant.contestId))
            .where(eq(contestParticipant.userId, currentUserId))
            .orderBy(desc(contest.startTime));

        return NextResponse.json({
            success: true,
            data: userContests
        });

    } catch (error) {
        console.error('Error fetching user contests:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user contests' },
            { status: 500 }
        );
    }
}
