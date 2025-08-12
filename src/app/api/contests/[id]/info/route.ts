import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contest, contestProblem, problem, contestParticipant } from '@/db/schema';
import { eq, count, sql } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: contestId } = await params;
        const contestIdNum = parseInt(contestId);

        if (isNaN(contestIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid contest ID' },
                { status: 400 }
            );
        }

        // Check if contest exists and is public
        const contestResult = await db
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
            .where(eq(contest.id, contestIdNum))
            .limit(1);

        if (contestResult.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Contest not found' },
                { status: 404 }
            );
        }

        const contestData = contestResult[0];

        if (!contestData.isPublic) {
            return NextResponse.json(
                { success: false, error: 'Contest is not public' },
                { status: 403 }
            );
        }

        // Count participants
        const participantCountResult = await db
            .select({ count: count() })
            .from(contestParticipant)
            .where(eq(contestParticipant.contestId, contestIdNum));

        const participants = participantCountResult[0]?.count || 0;

        // Fetch contest problems
        const problemsResult = await db
            .select({
                id: contestProblem.id,
                order: contestProblem.order,
                points: contestProblem.points,
                problemId: contestProblem.problemId,
                title: problem.title,
                timeLimit: problem.timeLimit,
                memoryLimit: problem.memoryLimit,
            })
            .from(contestProblem)
            .innerJoin(problem, eq(contestProblem.problemId, problem.id))
            .where(eq(contestProblem.contestId, contestIdNum))
            .orderBy(contestProblem.order);

        // Calculate total points
        const totalPoints = problemsResult.reduce((sum, p) => sum + (p.points || 0), 0);

        const contestInfoData = {
            id: contestData.id,
            title: contestData.title,
            description: contestData.description || '',
            startTime: contestData.startTime,
            endTime: contestData.endTime,
            isPublic: contestData.isPublic,
            problems: problemsResult,
            participants,
            totalPoints,
        };

        return NextResponse.json({
            success: true,
            data: contestInfoData
        });

    } catch (error) {
        console.error('Error fetching contest info:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch contest info' },
            { status: 500 }
        );
    }
}
