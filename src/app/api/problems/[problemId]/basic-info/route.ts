import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { problem } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ problemId: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { problemId } = await params;
        const problemIdNum = parseInt(problemId);

        if (isNaN(problemIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid problem ID' },
                { status: 400 }
            );
        }

        const { title, description, difficulty } = await request.json();

        if (!title || title.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Problem title is required' },
                { status: 400 }
            );
        }

        // Check if problem exists and user owns it
        const existingProblem = await db
            .select()
            .from(problem)
            .where(eq(problem.id, problemIdNum))
            .limit(1);

        if (existingProblem.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Problem not found' },
                { status: 404 }
            );
        }

        if (existingProblem[0].userId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: 'You can only edit your own problems' },
                { status: 403 }
            );
        }

        const updatedProblem = await db
            .update(problem)
            .set({
                title: title.trim(),
                description: description?.trim() || null,
                difficulty: difficulty || 'Easy',
                updatedAt: new Date()
            })
            .where(eq(problem.id, problemIdNum))
            .returning();

        return NextResponse.json({
            success: true,
            problem: updatedProblem[0],
            message: 'Problem updated successfully'
        });
    } catch (error) {
        console.error('Error updating problem:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update problem' },
            { status: 500 }
        );
    }
}
