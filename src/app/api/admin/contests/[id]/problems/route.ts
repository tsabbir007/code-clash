import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contestProblem, contest, problem } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Fetch all problems for a specific contest
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contestId = params.id;

        // Check if contest exists
        const existingContest = await db
            .select()
            .from(contest)
            .where(eq(contest.id, contestId))
            .limit(1);

        if (existingContest.length === 0) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        // Get all problems for this contest
        const contestProblems = await db
            .select({
                id: contestProblem.id,
                contestId: contestProblem.contestId,
                problemId: contestProblem.problemId,
                order: contestProblem.order,
                points: contestProblem.points,
                createdAt: contestProblem.createdAt,
                problem: {
                    id: problem.id,
                    title: problem.title,
                    difficulty: problem.difficulty,
                    category: problem.category,
                    timeLimit: problem.timeLimit,
                    memoryLimit: problem.memoryLimit,
                    isPublic: problem.isPublic
                }
            })
            .from(contestProblem)
            .innerJoin(problem, eq(contestProblem.problemId, problem.id))
            .where(eq(contestProblem.contestId, contestId))
            .orderBy(contestProblem.order);

        return NextResponse.json({ problems: contestProblems });
    } catch (error) {
        console.error('Error fetching contest problems:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Add a problem to a contest
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contestId = params.id;
        const body = await request.json();
        const { problemId, order, points } = body;

        // Validation
        if (!problemId) {
            return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
        }

        // Check if contest exists
        const existingContest = await db
            .select()
            .from(contest)
            .where(eq(contest.id, contestId))
            .limit(1);

        if (existingContest.length === 0) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        // Check if problem exists
        const existingProblem = await db
            .select()
            .from(problem)
            .where(eq(problem.id, problemId))
            .limit(1);

        if (existingProblem.length === 0) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        }

        // Check if problem is already in the contest
        const existingContestProblem = await db
            .select()
            .from(contestProblem)
            .where(and(
                eq(contestProblem.contestId, contestId),
                eq(contestProblem.problemId, problemId)
            ))
            .limit(1);

        if (existingContestProblem.length > 0) {
            return NextResponse.json({ error: 'Problem is already in this contest' }, { status: 400 });
        }

        // Add problem to contest
        const newContestProblem = await db
            .insert(contestProblem)
            .values({
                contestId,
                problemId,
                order: order || 0,
                points: points || 100,
                createdAt: new Date()
            })
            .returning();

        if (newContestProblem.length === 0) {
            throw new Error('Failed to add problem to contest');
        }

        return NextResponse.json(newContestProblem[0], { status: 201 });
    } catch (error) {
        console.error('Error adding problem to contest:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Remove a problem from a contest
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contestId = params.id;
        const { searchParams } = new URL(request.url);
        const problemId = searchParams.get('problemId');

        if (!problemId) {
            return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
        }

        // Check if contest exists
        const existingContest = await db
            .select()
            .from(contest)
            .where(eq(contest.id, contestId))
            .limit(1);

        if (existingContest.length === 0) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        // Remove problem from contest
        await db
            .delete(contestProblem)
            .where(and(
                eq(contestProblem.contestId, contestId),
                eq(contestProblem.problemId, problemId)
            ));

        return NextResponse.json({ message: 'Problem removed from contest successfully' });
    } catch (error) {
        console.error('Error removing problem from contest:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
