import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { testCase } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ problem_id: string; testcase_id: string }> }
) {
    try {
        const { problem_id, testcase_id } = await params;

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

        console.log('Updating test case:', testcase_id, 'for problem:', problem_id, 'by user:', session.user.id);

        // Update the test case
        const updatedTestCases = await db
            .update(testCase)
            .set({
                label: label.trim(),
                input: input.trim(),
                output: output.trim(),
                points,
                isSample: isSample || false,
            })
            .where(
                and(
                    eq(testCase.id, parseInt(testcase_id)),
                    eq(testCase.problemId, parseInt(problem_id))
                )
            )
            .returning();

        if (updatedTestCases.length === 0) {
            return NextResponse.json(
                { error: 'Test case not found' },
                { status: 404 }
            );
        }

        console.log('Test case updated successfully');

        return NextResponse.json({
            success: true,
            message: 'Test case updated successfully!',
            testCase: updatedTestCases[0]
        });

    } catch (error) {
        console.error('Error updating test case:', error);
        return NextResponse.json(
            { error: 'Failed to update test case' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ problem_id: string; testcase_id: string }> }
) {
    try {
        const { problem_id, testcase_id } = await params;

        // Get current user from session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('Deleting test case:', testcase_id, 'for problem:', problem_id, 'by user:', session.user.id);

        // Delete the test case
        const deletedTestCases = await db
            .delete(testCase)
            .where(
                and(
                    eq(testCase.id, parseInt(testcase_id)),
                    eq(testCase.problemId, parseInt(problem_id))
                )
            )
            .returning();

        if (deletedTestCases.length === 0) {
            return NextResponse.json(
                { error: 'Test case not found' },
                { status: 404 }
            );
        }

        console.log('Test case deleted successfully');

        return NextResponse.json({
            success: true,
            message: 'Test case deleted successfully!',
            testCase: deletedTestCases[0]
        });

    } catch (error) {
        console.error('Error deleting test case:', error);
        return NextResponse.json(
            { error: 'Failed to delete test case' },
            { status: 500 }
        );
    }
} 