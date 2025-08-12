import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { contestSubmission } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; 'submission-id': string }> }
) {
    try {
        // Get the current session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: contestId, 'submission-id': submissionId } = await params;
        const contestIdNum = parseInt(contestId);
        const submissionIdNum = parseInt(submissionId);

        if (isNaN(contestIdNum) || isNaN(submissionIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid contest ID or submission ID' },
                { status: 400 }
            );
        }

        // Get the contest submission with the linked regular submission ID
        const submissionResult = await db
            .select({
                id: contestSubmission.id,
                submissionId: contestSubmission.submissionId,
                problemId: contestSubmission.problemId,
                userId: contestSubmission.userId,
            })
            .from(contestSubmission)
            .where(and(
                eq(contestSubmission.id, submissionIdNum),
                eq(contestSubmission.contestId, contestIdNum),
                eq(contestSubmission.userId, session.user.id)
            ))
            .limit(1);

        if (submissionResult.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Submission not found or access denied' },
                { status: 404 }
            );
        }

        const submission = submissionResult[0];

        return NextResponse.json({
            success: true,
            message: 'Submission details retrieved successfully',
            data: {
                id: submission.id,
                submissionId: submission.submissionId,
                problemId: submission.problemId,
                userId: submission.userId,
            }
        });

    } catch (error) {
        console.error('Error getting submission details:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get submission details' },
            { status: 500 }
        );
    }
}
