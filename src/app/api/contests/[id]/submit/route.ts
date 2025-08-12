import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { contest, contestSubmission, contestParticipant, solution } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get the current session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: contestId } = await params;
        const contestIdNum = parseInt(contestId);

        if (isNaN(contestIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid contest ID' },
                { status: 400 }
            );
        }

        // Check if contest exists and is public
        const contestResult = await db
            .select()
            .from(contest)
            .where(eq(contest.id, contestIdNum))
            .limit(1);

        if (contestResult.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Contest not found' },
                { status: 404 }
            );
        }

        const contestData = contestResult[0];

        if (!contestData.isPublic) {
            return NextResponse.json(
                { success: false, error: 'Contest is not public' },
                { status: 403 }
            );
        }

        // Check if contest is currently active
        const now = new Date();
        const startTime = new Date(contestData.startTime);
        const endTime = new Date(contestData.endTime);

        if (now < startTime || now > endTime) {
            return NextResponse.json(
                { success: false, error: 'Contest is not currently active' },
                { status: 400 }
            );
        }

        const currentUserId = session.user.id;

        // Check if user is registered for the contest
        const registrationResult = await db
            .select()
            .from(contestParticipant)
            .where(and(
                eq(contestParticipant.contestId, contestIdNum),
                eq(contestParticipant.userId, currentUserId)
            ))
            .limit(1);

        if (registrationResult.length === 0) {
            return NextResponse.json(
                { success: false, error: 'You must be registered for this contest to submit solutions' },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { problemId, language, sourceCode } = body;

        if (!problemId || !language || !sourceCode) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: problemId, language, sourceCode' },
                { status: 400 }
            );
        }

        if (typeof problemId !== 'number' || typeof language !== 'string' || typeof sourceCode !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Invalid field types' },
                { status: 400 }
            );
        }

        if (sourceCode.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Source code cannot be empty' },
                { status: 400 }
            );
        }

        // Validate language
        const validLanguages = ['cpp', 'java', 'python', 'javascript'];
        if (!validLanguages.includes(language)) {
            return NextResponse.json(
                { success: false, error: 'Invalid programming language' },
                { status: 400 }
            );
        }

        // First, create a solution record (this will be executed by the existing system)
        const solutionResult = await db.insert(solution).values({
            problemId: problemId,
            label: `Contest ${contestIdNum} - Problem ${problemId}`,
            language: language,
            sourceCode: sourceCode.trim(),
            verdict: 'Pending',
            addedBy: currentUserId,
            createdAt: new Date()
        }).returning();

        // Then create a contest submission record that references the solution
        const contestSubmissionResult = await db.insert(contestSubmission).values({
            contestId: contestIdNum,
            problemId: problemId,
            userId: currentUserId,
            language: language,
            sourceCode: sourceCode.trim(),
            verdict: 'Pending',
            score: 0, // Will be updated after execution
            submissionTime: new Date(),
            createdAt: new Date(),
            // Reference to the solution for execution tracking
            submissionId: solutionResult[0].id
        }).returning();

        return NextResponse.json({
            success: true,
            message: 'Solution submitted successfully',
            data: {
                submissionId: contestSubmissionResult[0].id,
                regularSubmissionId: solutionResult[0].id,
                verdict: 'Pending',
                status: 'submitted',
                message: 'Submission received and queued for execution',
                linkedSubmissionId: solutionResult[0].id // Add this for execution
            }
        });

    } catch (error) {
        console.error('Error submitting solution:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit solution' },
            { status: 500 }
        );
    }
}
