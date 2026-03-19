import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contest, contestProblem, problem, contestSubmission } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ contestId: string }> }
) {
    try {
        const { contestId } = await params;
        const contestIdNum = parseInt(contestId);

        if (isNaN(contestIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid contest ID' },
                { status: 400 }
            );
        }

        // Check if contest exists and is public
        const contestResult = await db
            .select()
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

        // Check if contest is currently active
        const now = new Date();
        const startTime = new Date(contestData.startTime);
        const endTime = new Date(contestData.endTime);

        if (now < startTime || now > endTime) {
            return NextResponse.json(
                { success: false, error: 'Contest is not currently active' },
                { status: 400 }
            );
        }

        // TODO: Get current user ID from authentication
        // For now, we'll use a placeholder user ID
        const currentUserId = 'temp-user-id'; // This should come from auth context

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

        // Fetch user's submissions for this contest
        const submissionsResult = await db
            .select({
                id: contestSubmission.id,
                problemId: contestSubmission.problemId,
                language: contestSubmission.language,
                verdict: contestSubmission.verdict,
                score: contestSubmission.score,
                submissionTime: contestSubmission.submissionTime,
            })
            .from(contestSubmission)
            .where(and(
                eq(contestSubmission.contestId, contestIdNum),
                eq(contestSubmission.userId, currentUserId)
            ))
            .orderBy(contestSubmission.submissionTime);

        // Calculate total points
        const totalPoints = problemsResult.reduce((sum, p) => sum + (p.points || 0), 0);

        // Calculate solved problems count
        const solvedProblems = submissionsResult.filter(sub => sub.verdict === 'Accepted' || sub.verdict === 'AC').length;

        // Calculate remaining time
        const remainingTime = Math.max(0, endTime.getTime() - now.getTime());

        const contestParticipationData = {
            id: contestData.id,
            title: contestData.title,
            description: contestData.description || '',
            startTime: contestData.startTime,
            endTime: contestData.endTime,
            problems: problemsResult,
            submissions: submissionsResult,
            totalPoints,
            solvedProblems,
            remainingTime,
        };

        return NextResponse.json({
            success: true,
            data: contestParticipationData
        });

    } catch (error) {
        console.error('Error fetching contest participation data:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch contest participation data' },
            { status: 500 }
        );
    }
}
