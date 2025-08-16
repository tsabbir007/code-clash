import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { problem } from '@/db/schema';
import { auth } from '@/lib/auth-server';
import { eq } from 'drizzle-orm';

export async function PUT(
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

        const { statement } = await request.json();

        console.log('Updating statement for problem:', problemId, 'by user:', session.user.id);

        // Update the problem statement
        const updatedProblems = await db
            .update(problem)
            .set({
                statement: statement,
                updatedAt: new Date(),
            })
            .where(eq(problem.id, parseInt(problemId)))
            .returning();

        if (updatedProblems.length === 0) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        console.log('Statement updated successfully');

        return NextResponse.json({
            success: true,
            message: 'Statement updated successfully!',
            problem: updatedProblems[0]
        });

    } catch (error) {
        console.error('Error updating statement:', error);
        return NextResponse.json(
            { error: 'Failed to update statement' },
            { status: 500 }
        );
    }
}

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

        // Get problem statement
        const problems = await db
            .select({
                id: problem.id,
                title: problem.title,
                statement: problem.statement,
            })
            .from(problem)
            .where(eq(problem.id, parseInt(problemId)));

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
        console.error('Error fetching statement:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statement' },
            { status: 500 }
        );
    }
} 