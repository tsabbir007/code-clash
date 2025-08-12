import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { contestSubmission } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
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

        // Parse request body
        const body = await request.json();
        const { verdict, score, cpuTime, memoryUsage } = body;

        if (!verdict) {
            return NextResponse.json(
                { success: false, error: 'Verdict is required' },
                { status: 400 }
            );
        }

        // Update the contest submission
        const updatedSubmission = await db
            .update(contestSubmission)
            .set({
                verdict,
                score: score || 0,
                cpuTime: cpuTime || 0,
                memoryUsage: memoryUsage || 0,
            })
            .where(and(
                eq(contestSubmission.id, submissionIdNum),
                eq(contestSubmission.contestId, contestIdNum),
                eq(contestSubmission.userId, session.user.id)
            ))
            .returning();

        if (updatedSubmission.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Submission not found or access denied' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Submission verdict updated successfully',
            data: updatedSubmission[0]
        });

    } catch (error) {
        console.error('Error updating submission verdict:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update submission verdict' },
            { status: 500 }
        );
    }
}
