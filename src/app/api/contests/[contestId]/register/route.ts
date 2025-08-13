import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { contest, contestParticipant } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ contestId: string }> }
) {
    try {
        // Get the current session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { contestId } = await params;
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

        // Check if contest is upcoming (not started yet)
        const now = new Date();
        const startTime = new Date(contestData.startTime);

        // For development/testing: Allow registration during contest
        // TODO: In production, uncomment this check to only allow registration before contest starts
        /*
        if (now >= startTime) {
            return NextResponse.json(
                { success: false, error: 'Contest has already started' },
                { status: 400 }
            );
        }
        */

        // For development: Check if contest is still ongoing (not ended)
        const endTime = new Date(contestData.endTime);
        if (now > endTime) {
            return NextResponse.json(
                { success: false, error: 'Contest has already ended' },
                { status: 400 }
            );
        }

        const currentUserId = session.user.id;

        // Check if user is already registered
        const existingRegistration = await db
            .select()
            .from(contestParticipant)
            .where(and(
                eq(contestParticipant.contestId, contestIdNum),
                eq(contestParticipant.userId, currentUserId)
            ))
            .limit(1);

        if (existingRegistration.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Already registered for this contest' },
                { status: 400 }
            );
        }

        // Register user for the contest
        await db.insert(contestParticipant).values({
            contestId: contestIdNum,
            userId: currentUserId,
            joinedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully registered for contest'
        });

    } catch (error) {
        console.error('Error registering for contest:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to register for contest' },
            { status: 500 }
        );
    }
}
