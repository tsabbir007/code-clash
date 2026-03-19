import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { testCase, problem } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ problemId: string }> }
) {
    try {
        const { problemId } = await params;

        // Get current user from session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get problem and test cases
        const problems = await db
            .select({
                id: problem.id,
                title: problem.title,
            })
            .from(problem)
            .where(eq(problem.id, parseInt(problemId)));

        if (problems.length === 0) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        const testCases = await db
            .select({
                id: testCase.id,
                label: testCase.label,
                input: testCase.input,
                output: testCase.output,
                points: testCase.points,
                isSample: testCase.isSample,
                createdAt: testCase.createdAt,
            })
            .from(testCase)
            .where(eq(testCase.problemId, parseInt(problemId)))
            .orderBy(testCase.createdAt);

        return NextResponse.json({
            success: true,
            problem: problems[0],
            testCases
        });

    } catch (error) {
        console.error('Error fetching test cases:', error);
        return NextResponse.json(
            { error: 'Failed to fetch test cases' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ problemId: string }> }
) {
    try {
        const { problemId } = await params;

        // Get current user from session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { label, input, output, points, isSample } = await request.json();

        // Validate input
        if (!label || !label.trim()) {
            return NextResponse.json(
                { error: 'Label is required' },
                { status: 400 }
            );
        }

        if (!input || !input.trim()) {
            return NextResponse.json(
                { error: 'Input is required' },
                { status: 400 }
            );
        }

        if (!output || !output.trim()) {
            return NextResponse.json(
                { error: 'Output is required' },
                { status: 400 }
            );
        }

        if (points < 1 || points > 100) {
            return NextResponse.json(
                { error: 'Points must be between 1 and 100' },
                { status: 400 }
            );
        }

        console.log('Creating test case for problem:', problemId, 'by user:', session.user.id);

        // Create new test case
        const newTestCase = await db
            .insert(testCase)
            .values({
                problemId: parseInt(problemId),
                label: label.trim(),
                input: input.trim(),
                output: output.trim(),
                points,
                isSample: isSample || false,
                addedBy: session.user.id,
            })
            .returning();

        console.log('Test case created successfully:', newTestCase[0]);

        return NextResponse.json({
            success: true,
            message: 'Test case created successfully!',
            testCase: newTestCase[0]
        });

    } catch (error) {
        console.error('Error creating test case:', error);
        return NextResponse.json(
            { error: 'Failed to create test case' },
            { status: 500 }
        );
    }
} 