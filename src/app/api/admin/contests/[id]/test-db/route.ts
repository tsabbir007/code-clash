import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contest, contestProblem, problem } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log('Test DB API called with params:', params);
        
        const { id: contestId } = await params;
        console.log('Contest ID extracted:', contestId);
        
        const contestIdNum = parseInt(contestId);
        console.log('Contest ID parsed:', contestIdNum);

        if (isNaN(contestIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid contest ID' },
                { status: 400 }
            );
        }

        // Test 1: Check if contest exists
        console.log('Testing contest query...');
        const contestResult = await db
            .select()
            .from(contest)
            .where(eq(contest.id, contestIdNum))
            .limit(1);

        console.log('Contest query result:', contestResult);

        // Test 2: Check if contest_problem table has data
        console.log('Testing contest_problem query...');
        const contestProblemsResult = await db
            .select()
            .from(contestProblem)
            .where(eq(contestProblem.contestId, contestIdNum));

        console.log('Contest problems query result:', contestProblemsResult);

        // Test 3: Check if we can join with problem table
        console.log('Testing join query...');
        const problemsWithDetails = await db
            .select({
                contestProblemId: contestProblem.id,
                order: contestProblem.order,
                points: contestProblem.points,
                problemId: contestProblem.problemId,
                problemTitle: problem.title,
            })
            .from(contestProblem)
            .innerJoin(problem, eq(contestProblem.problemId, problem.id))
            .where(eq(contestProblem.contestId, contestIdNum));

        console.log('Join query result:', problemsWithDetails);

        return NextResponse.json({
            success: true,
            data: {
                contest: contestResult[0] || null,
                contestProblems: contestProblemsResult,
                problemsWithDetails: problemsWithDetails,
                summary: {
                    contestExists: contestResult.length > 0,
                    contestProblemsCount: contestProblemsResult.length,
                    problemsWithDetailsCount: problemsWithDetails.length
                }
            }
        });

    } catch (error) {
        console.error('Error in test DB route:', error);
        return NextResponse.json(
            { success: false, error: 'Database test failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
