import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { problem, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        // Get current user from session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name } = await request.json();

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Problem name is required' },
                { status: 400 }
            );
        }

        console.log('Creating new problem:', name, 'for user:', session.user.id);

        // Create new problem with auto-generated ID
        const newProblem = await db
            .insert(problem)
            .values({
                title: name.trim(),
                statement: null, // Will be set later
                userId: session.user.id,
                timeLimit: 1000, // Default 1 second
                memoryLimit: 256, // Default 256KB
                checkerType: 'fcmp', // Default checker
            })
            .returning();

        console.log('Problem created successfully:', newProblem[0]);

        return NextResponse.json({
            success: true,
            message: 'Problem created successfully!',
            problem: newProblem[0]
        });

    } catch (error) {
        console.error('Error creating problem:', error);
        return NextResponse.json(
            { error: 'Failed to create problem' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get current user from session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get problems with user information
        const problems = await db
            .select({
                id: problem.id,
                title: problem.title,
                statement: problem.statement,
                createdAt: problem.createdAt,
                updatedAt: problem.updatedAt,
                userName: user.name,
                userEmail: user.email,
            })
            .from(problem)
            .leftJoin(user, eq(problem.userId, user.id))
            .orderBy(problem.createdAt);

        return NextResponse.json({
            success: true,
            problems
        });

    } catch (error) {
        console.error('Error fetching problems:', error);
        return NextResponse.json(
            { error: 'Failed to fetch problems' },
            { status: 500 }
        );
    }
} 