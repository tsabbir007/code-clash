import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contestProblem, problem, contest, contestSubmission } from '@/db/schema';
import { eq, and, count, sql } from 'drizzle-orm';

// GET - Fetch all contest problems across all contests
export async function GET(request: NextRequest) {
    try {
        // Get all contest problems with problem and contest details
        const contestProblems = await db
            .select({
                id: contestProblem.id,
                contestId: contestProblem.contestId,
                contestTitle: contest.title,
                problemId: contestProblem.problemId,
                problemTitle: problem.title,
                problemDescription: problem.description,
                difficulty: problem.difficulty,
                points: contestProblem.points,
                order: contestProblem.order,
                createdAt: contestProblem.createdAt,
            })
            .from(contestProblem)
            .innerJoin(problem, eq(contestProblem.problemId, problem.id))
            .innerJoin(contest, eq(contestProblem.contestId, contest.id))
            .orderBy(contestProblem.contestId, contestProblem.order);

        // Get submission statistics for each contest problem
        const problemsWithStats = await Promise.all(
            contestProblems.map(async (cp) => {
                // Get total submissions for this problem in this contest
                const submissionsResult = await db
                    .select({ count: count() })
                    .from(contestSubmission)
                    .where(and(
                        eq(contestSubmission.problemId, cp.problemId),
                        eq(contestSubmission.contestId, cp.contestId)
                    ));

                const totalSubmissions = submissionsResult[0]?.count || 0;

                // Get solved count (submissions with score > 0)
                const solvedResult = await db
                    .select({ count: count() })
                    .from(contestSubmission)
                    .where(and(
                        eq(contestSubmission.problemId, cp.problemId),
                        eq(contestSubmission.contestId, cp.contestId),
                        sql`${contestSubmission.score} > 0`
                    ));

                const solvedCount = solvedResult[0]?.count || 0;

                // Get average score
                const avgScoreResult = await db
                    .select({ avgScore: sql<number>`AVG(${contestSubmission.score})` })
                    .from(contestSubmission)
                    .where(and(
                        eq(contestSubmission.problemId, cp.problemId),
                        eq(contestSubmission.contestId, cp.contestId)
                    ));

                const averageScore = avgScoreResult[0]?.avgScore || 0;

                return {
                    ...cp,
                    submissions: totalSubmissions,
                    solvedCount,
                    averageScore: Math.round(averageScore * 100) / 100
                };
            })
        );

        return NextResponse.json({
            success: true,
            problems: problemsWithStats
        });

    } catch (error) {
        console.error('Error fetching contest problems:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
