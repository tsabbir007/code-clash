import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contest, contestProblem, problem, contestParticipant, contestSubmission, user } from '@/db/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log('Overview API called with params:', params);

        const { id: contestId } = await params;
        console.log('Contest ID extracted:', contestId);

        const contestIdNum = parseInt(contestId);
        console.log('Contest ID parsed:', contestIdNum);

        if (isNaN(contestIdNum)) {
            console.log('Invalid contest ID');
            return NextResponse.json(
                { success: false, error: 'Invalid contest ID' },
                { status: 400 }
            );
        }

        // Fetch contest details
        console.log('Fetching contest with ID:', contestIdNum);
        const contestResult = await db
            .select()
            .from(contest)
            .where(eq(contest.id, contestIdNum))
            .limit(1);

        console.log('Contest query result:', contestResult);

        if (contestResult.length === 0) {
            console.log('Contest not found in database');
            return NextResponse.json(
                { success: false, error: 'Contest not found' },
                { status: 404 }
            );
        }

        const contestData = contestResult[0];
        console.log('Contest data found:', contestData);

        // Fetch contest problems with problem details
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

        console.log('Problems found:', problemsResult.length);

        // Fetch participant count
        const participantCountResult = await db
            .select({ count: count() })
            .from(contestParticipant)
            .where(eq(contestParticipant.contestId, contestIdNum));

        const participantCount = participantCountResult[0]?.count || 0;
        console.log('Participant count:', participantCount);

        // Fetch recent submissions (last 10)
        const recentSubmissionsResult = await db
            .select({
                id: contestSubmission.id,
                problemId: contestSubmission.problemId,
                userId: contestSubmission.userId,
                language: contestSubmission.language,
                verdict: contestSubmission.verdict,
                score: contestSubmission.score,
                submissionTime: contestSubmission.submissionTime,
                problemTitle: problem.title,
                userName: user.name,
            })
            .from(contestSubmission)
            .innerJoin(problem, eq(contestSubmission.problemId, problem.id))
            .innerJoin(user, eq(contestSubmission.userId, user.id))
            .where(eq(contestSubmission.contestId, contestIdNum))
            .orderBy(desc(contestSubmission.submissionTime))
            .limit(10);

        console.log('Recent submissions found:', recentSubmissionsResult.length);

        // Calculate total points
        const totalPoints = problemsResult.reduce((sum, p) => sum + (p.points || 0), 0);

        // Calculate contest statistics
        const submissionsResult = await db
            .select({ count: count() })
            .from(contestSubmission)
            .where(eq(contestSubmission.contestId, contestIdNum));

        const totalSubmissions = submissionsResult[0]?.count || 0;

        // Calculate average score
        const avgScoreResult = await db
            .select({ avgScore: sql<number>`avg(${contestSubmission.score})` })
            .from(contestSubmission)
            .where(eq(contestSubmission.contestId, contestIdNum));

        const averageScore = avgScoreResult[0]?.avgScore || 0;

        // Calculate solved problems count
        const solvedProblemsResult = await db
            .select({ count: count() })
            .from(contestSubmission)
            .where(and(
                eq(contestSubmission.contestId, contestIdNum),
                eq(contestSubmission.verdict, 'Accepted')
            ));

        const solvedProblems = solvedProblemsResult[0]?.count || 0;

        // Calculate contest duration
        const startTime = new Date(contestData.startTime);
        const endTime = new Date(contestData.endTime);
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        const overviewData = {
            contest: {
                id: contestData.id,
                title: contestData.title,
                description: contestData.description || '',
                startTime: contestData.startTime,
                endTime: contestData.endTime,
                isPublic: contestData.isPublic,
                createdAt: contestData.createdAt,
                createdBy: contestData.createdBy,
            },
            statistics: {
                participants: participantCount,
                problems: problemsResult.length,
                totalPoints,
                submissions: totalSubmissions,
                averageScore: Math.round(averageScore),
                solvedProblems,
                duration: {
                    hours: durationHours,
                    minutes: durationMinutes,
                    totalMs: durationMs,
                }
            },
            problems: problemsResult,
            recentSubmissions: recentSubmissionsResult,
        };

        console.log('Overview data prepared successfully');
        return NextResponse.json({
            success: true,
            data: overviewData
        });

    } catch (error) {
        console.error('Error fetching contest overview:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch contest overview' },
            { status: 500 }
        );
    }
}
