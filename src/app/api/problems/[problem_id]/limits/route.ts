import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { problem } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function PUT(
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

        const { timeLimit, memoryLimit } = await request.json();

        // Validate limits
        if (timeLimit < 100 || timeLimit > 10000) {
            return NextResponse.json(
                { error: 'Time limit must be between 100ms and 10,000ms' },
                { status: 400 }
            );
        }

        if (memoryLimit < 16 || memoryLimit > 512000) {
            return NextResponse.json(
                { error: 'Memory limit must be between 16KB and 512,000KB' },
                { status: 400 }
            );
        }

        console.log('Updating limits for problem:', problem_id, 'by user:', session.user.id);

        // Update the problem limits
        const updatedProblems = await db
            .update(problem)
            .set({
                timeLimit,
                memoryLimit,
                updatedAt: new Date(),
            })
            .where(eq(problem.id, parseInt(problem_id)))
            .returning();

        if (updatedProblems.length === 0) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        console.log('Limits updated successfully');

        return NextResponse.json({
            success: true,
            message: 'Limits updated successfully!',
            problem: updatedProblems[0]
        });

    } catch (error) {
        console.error('Error updating limits:', error);
        return NextResponse.json(
            { error: 'Failed to update limits' },
            { status: 500 }
        );
    }
}

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

        // Get problem limits
        const problems = await db
            .select({
                id: problem.id,
                title: problem.title,
                timeLimit: problem.timeLimit,
                memoryLimit: problem.memoryLimit,
            })
            .from(problem)
            .where(eq(problem.id, parseInt(problem_id)));

        if (problems.length === 0) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            problem: problems[0]
        });

    } catch (error) {
        console.error('Error fetching limits:', error);
        return NextResponse.json(
            { error: 'Failed to fetch limits' },
            { status: 500 }
        );
    }
} 