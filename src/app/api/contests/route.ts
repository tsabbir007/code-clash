import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contest, contestProblem, contestParticipant } from '@/db/schema';
import { eq, count, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        // Fetch all public contests
        const contestsResult = await db
            .select({
                id: contest.id,
                title: contest.title,
                description: contest.description,
                startTime: contest.startTime,
                endTime: contest.endTime,
                isPublic: contest.isPublic,
                createdAt: contest.createdAt,
                createdBy: contest.createdBy,
            })
            .from(contest)
            .where(eq(contest.isPublic, true))
            .orderBy(contest.startTime);

        // For each contest, fetch additional statistics
        const contestsWithStats = await Promise.all(
            contestsResult.map(async (contestData) => {
                // Count participants
                const participantCountResult = await db
                    .select({ count: count() })
                    .from(contestParticipant)
                    .where(eq(contestParticipant.contestId, contestData.id));

                const participants = participantCountResult[0]?.count || 0;

                // Count problems
                const problemCountResult = await db
                    .select({ count: count() })
                    .from(contestProblem)
                    .where(eq(contestProblem.contestId, contestData.id));

                const problems = problemCountResult[0]?.count || 0;

                // Calculate total points
                const totalPointsResult = await db
                    .select({ totalPoints: sql<number>`sum(${contestProblem.points})` })
                    .from(contestProblem)
                    .where(eq(contestProblem.contestId, contestData.id));

                const totalPoints = totalPointsResult[0]?.totalPoints || 0;

                return {
                    ...contestData,
                    participants,
                    problems,
                    totalPoints,
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: contestsWithStats
        });

    } catch (error) {
        console.error('Error fetching contests:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch contests' },
            { status: 500 }
        );
    }
}
