import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submission } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const submissionId = parseInt(id);

        if (isNaN(submissionId)) {
            return NextResponse.json(
                { error: 'Invalid submission ID' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const {
            verdict,
            score,
            cpuTime,
            memoryUsage,
            testCasesPassed,
            totalTestCases
        } = body;

        // Update submission with results
        const updatedSubmission = await db
            .update(submission)
            .set({
                verdict: verdict || 'Unknown',
                score: score || 0,
                cpuTime: cpuTime || 0,
                memoryUsage: memoryUsage || 0,
                testCasesPassed: testCasesPassed || 0,
                totalTestCases: totalTestCases || 0
            })
            .where(eq(submission.id, submissionId))
            .returning();

        if (updatedSubmission.length === 0) {
            return NextResponse.json(
                { error: 'Submission not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            submission: updatedSubmission[0]
        });

    } catch (error) {
        console.error('Error updating submission:', error);
        return NextResponse.json(
            { error: 'Failed to update submission' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const submissionId = parseInt(id);

        if (isNaN(submissionId)) {
            return NextResponse.json(
                { error: 'Invalid submission ID' },
                { status: 400 }
            );
        }

        // Get submission details
        const submissionData = await db
            .select()
            .from(submission)
            .where(eq(submission.id, submissionId))
            .limit(1);

        if (submissionData.length === 0) {
            return NextResponse.json(
                { error: 'Submission not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            submission: submissionData[0]
        });

    } catch (error) {
        console.error('Error fetching submission:', error);
        return NextResponse.json(
            { error: 'Failed to fetch submission' },
            { status: 500 }
        );
    }
}
