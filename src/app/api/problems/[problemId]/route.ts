import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { problem, user, problemCategory } from '@/db/schema';
import { auth } from '@/lib/auth-server';
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

        // Get problem with user information
        const problems = await db
            .select({
                id: problem.id,
                title: problem.title,
                statement: problem.statement,
                timeLimit: problem.timeLimit,
                memoryLimit: problem.memoryLimit,
                checkerType: problem.checkerType,
                customChecker: problem.customChecker,
                createdAt: problem.createdAt,
                updatedAt: problem.updatedAt,
                userName: user.name,
                userEmail: user.email,
            })
            .from(problem)
            .leftJoin(user, eq(problem.userId, user.id))
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
        console.error('Error fetching problem:', error);
        return NextResponse.json(
            { error: 'Failed to fetch problem' },
            { status: 500 }
        );
    }
}

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
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description, difficulty, timeLimit, memoryLimit, checkerType, categories } = body;

        // Validate required fields
        if (!title || !title.trim()) {
            return NextResponse.json(
                { success: false, error: 'Problem title is required' },
                { status: 400 }
            );
        }

        if (!description || !description.trim()) {
            return NextResponse.json(
                { success: false, error: 'Problem description is required' },
                { status: 400 }
            );
        }

        // Validate categories if provided
        if (categories && !Array.isArray(categories)) {
            return NextResponse.json(
                { success: false, error: 'Categories must be an array' },
                { status: 400 }
            );
        }

        // Update the problem
        const updatedProblem = await db
            .update(problem)
            .set({
                title: title.trim(),
                description: description.trim(),
                difficulty,
                timeLimit,
                memoryLimit,
                checkerType,
                updatedAt: new Date()
            })
            .where(eq(problem.id, parseInt(problemId)))
            .returning();

        if (updatedProblem.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Problem not found' },
                { status: 404 }
            );
        }

        // Update categories if provided
        if (categories !== undefined) {
            // Delete existing problem-category relationships
            await db
                .delete(problemCategory)
                .where(eq(problemCategory.problemId, parseInt(problemId)));

            // Insert new problem-category relationships
            if (categories.length > 0) {
                const categoryInserts = categories.map((categoryId: number) => ({
                    problemId: parseInt(problemId),
                    categoryId: categoryId
                }));

                await db.insert(problemCategory).values(categoryInserts);
            }
        }

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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ problemId: string }> }
) {
    try {
        const { problemId } = await params;

        // Get current user from session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Delete the problem
        const deletedProblem = await db
            .delete(problem)
            .where(eq(problem.id, parseInt(problemId)))
            .returning();

        if (deletedProblem.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Problem not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Problem deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting problem:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete problem' },
            { status: 500 }
        );
    }
} 