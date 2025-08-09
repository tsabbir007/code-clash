import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { problem, testCase } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ problem_id: string }> }
) {
    try {
        const { problem_id } = await params;

        // Get current user from session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get problem details
        const problems = await db
            .select()
            .from(problem)
            .where(eq(problem.id, parseInt(problem_id)));

        if (problems.length === 0) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        const problemData = problems[0];

        // Get sample test cases (where isSample = true)
        const sampleTestCases = await db
            .select()
            .from(testCase)
            .where(
                and(
                    eq(testCase.problemId, parseInt(problem_id)),
                    eq(testCase.isSample, true)
                )
            );

        // Filter sample test cases (first 2 are considered samples)
        const samples = sampleTestCases.slice(0, 2);
        const hidden = sampleTestCases.slice(2);

        return NextResponse.json({
            success: true,
            problem: {
                id: problemData.id,
                title: problemData.title,
                statement: problemData.statement,
                timeLimit: problemData.timeLimit,
                memoryLimit: problemData.memoryLimit,
                checkerType: problemData.checkerType,
                customChecker: problemData.customChecker,
                createdAt: problemData.createdAt,
                updatedAt: problemData.updatedAt,
            },
            sampleTestCases: samples,
            totalTestCases: sampleTestCases.length,
            hiddenTestCases: hidden.length
        });

    } catch (error) {
        console.error('Error fetching problem preview:', error);
        return NextResponse.json(
            { error: 'Failed to fetch problem preview' },
            { status: 500 }
        );
    }
} 