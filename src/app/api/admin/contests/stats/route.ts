import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contestProblem, contestClarification, contestAnnouncement, contestParticipant, contestSubmission, contestModerator } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const contestId = searchParams.get('contestId');

        if (!contestId) {
            return NextResponse.json({ error: 'Contest ID is required' }, { status: 400 });
        }

        const contestIdNum = parseInt(contestId);
        if (isNaN(contestIdNum)) {
            return NextResponse.json({ error: 'Invalid contest ID' }, { status: 400 });
        }

        // Get counts for each statistic
        const [problemsResult] = await db
            .select({ count: count() })
            .from(contestProblem)
            .where(eq(contestProblem.contestId, contestIdNum));

        const [clarificationsResult] = await db
            .select({ count: count() })
            .from(contestClarification)
            .where(eq(contestClarification.contestId, contestIdNum));

        const [announcementsResult] = await db
            .select({ count: count() })
            .from(contestAnnouncement)
            .where(eq(contestAnnouncement.contestId, contestIdNum));

        const [participantsResult] = await db
            .select({ count: count() })
            .from(contestParticipant)
            .where(eq(contestParticipant.contestId, contestIdNum));

        const [submissionsResult] = await db
            .select({ count: count() })
            .from(contestSubmission)
            .where(eq(contestSubmission.contestId, contestIdNum));

        const [moderatorsResult] = await db
            .select({ count: count() })
            .from(contestModerator)
            .where(eq(contestModerator.contestId, contestIdNum));

        // Get pending clarifications count
        const [pendingClarificationsResult] = await db
            .select({ count: count() })
            .from(contestClarification)
            .where(and(
                eq(contestClarification.contestId, contestIdNum),
                eq(contestClarification.status, 'pending')
            ));

        const stats = {
            problems: problemsResult?.count || 0,
            clarifications: clarificationsResult?.count || 0,
            announcements: announcementsResult?.count || 0,
            participants: participantsResult?.count || 0,
            submissions: submissionsResult?.count || 0,
            moderators: moderatorsResult?.count || 0,
            pendingClarifications: pendingClarificationsResult?.count || 0
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Error fetching contest stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
