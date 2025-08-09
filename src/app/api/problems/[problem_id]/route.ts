import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { problem, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

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
        console.error('Error fetching problem:', error);
        return NextResponse.json(
            { error: 'Failed to fetch problem' },
            { status: 500 }
        );
    }
} 