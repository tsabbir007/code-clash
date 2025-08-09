import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { solution } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ problem_id: string; solution_id: string }> }
) {
    try {
        const { problem_id, solution_id } = await params;

        // Get current user from session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { label, note, language, sourceCode, verdict, cpuTime, memoryUsage } = await request.json();

        // Validate input
        if (!label || !label.trim()) {
            return NextResponse.json(
                { error: 'Label is required' },
                { status: 400 }
            );
        }

        if (!language) {
            return NextResponse.json(
                { error: 'Language is required' },
                { status: 400 }
            );
        }

        if (!sourceCode || !sourceCode.trim()) {
            return NextResponse.json(
                { error: 'Source code is required' },
                { status: 400 }
            );
        }

        console.log('Updating solution:', solution_id, 'for problem:', problem_id, 'by user:', session.user.id);

        // Update the solution
        const updatedSolutions = await db
            .update(solution)
            .set({
                label: label.trim(),
                note: note?.trim() || '',
                language,
                sourceCode: sourceCode.trim(),
                verdict: verdict || 'Pending',
                cpuTime: cpuTime || 0,
                memoryUsage: memoryUsage || 0,
            })
            .where(
                and(
                    eq(solution.id, parseInt(solution_id)),
                    eq(solution.problemId, parseInt(problem_id))
                )
            )
            .returning();

        if (updatedSolutions.length === 0) {
            return NextResponse.json(
                { error: 'Solution not found' },
                { status: 404 }
            );
        }

        console.log('Solution updated successfully');

        return NextResponse.json({
            success: true,
            message: 'Solution updated successfully!',
            solution: updatedSolutions[0]
        });

    } catch (error) {
        console.error('Error updating solution:', error);
        return NextResponse.json(
            { error: 'Failed to update solution' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ problem_id: string; solution_id: string }> }
) {
    try {
        const { problem_id, solution_id } = await params;

        // Get current user from session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('Deleting solution:', solution_id, 'for problem:', problem_id, 'by user:', session.user.id);

        // Delete the solution
        const deletedSolutions = await db
            .delete(solution)
            .where(
                and(
                    eq(solution.id, parseInt(solution_id)),
                    eq(solution.problemId, parseInt(problem_id))
                )
            )
            .returning();

        if (deletedSolutions.length === 0) {
            return NextResponse.json(
                { error: 'Solution not found' },
                { status: 404 }
            );
        }

        console.log('Solution deleted successfully');

        return NextResponse.json({
            success: true,
            message: 'Solution deleted successfully!',
            solution: deletedSolutions[0]
        });

    } catch (error) {
        console.error('Error deleting solution:', error);
        return NextResponse.json(
            { error: 'Failed to delete solution' },
            { status: 500 }
        );
    }
} 