import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { solution, problem } from '@/db/schema';
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

        // Get problem and solutions
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

        const solutions = await db
            .select({
                id: solution.id,
                label: solution.label,
                note: solution.note,
                language: solution.language,
                sourceCode: solution.sourceCode,
                verdict: solution.verdict,
                cpuTime: solution.cpuTime,
                memoryUsage: solution.memoryUsage,
                createdAt: solution.createdAt,
            })
            .from(solution)
            .where(eq(solution.problemId, parseInt(problem_id)))
            .orderBy(solution.createdAt);

        return NextResponse.json({
            success: true,
            problem: problems[0],
            solutions
        });

    } catch (error) {
        console.error('Error fetching solutions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch solutions' },
            { status: 500 }
        );
    }
}

export async function POST(
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

        const { label, note, language, sourceCode } = await request.json();

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

        console.log('Creating solution for problem:', problem_id, 'by user:', session.user.id);

        // Create new solution
        const newSolution = await db
            .insert(solution)
            .values({
                problemId: parseInt(problem_id),
                label: label.trim(),
                note: note?.trim() || '',
                language,
                sourceCode: sourceCode.trim(),
                verdict: 'Pending',
                cpuTime: 0,
                memoryUsage: 0,
                addedBy: session.user.id,
            })
            .returning();

        console.log('Solution created successfully:', newSolution[0]);

        return NextResponse.json({
            success: true,
            message: 'Solution created successfully!',
            solution: newSolution[0]
        });

    } catch (error) {
        console.error('Error creating solution:', error);
        return NextResponse.json(
            { error: 'Failed to create solution' },
            { status: 500 }
        );
    }
} 