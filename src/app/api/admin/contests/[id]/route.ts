import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contest } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch contest by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contestId = params.id;

        const contestData = await db
            .select()
            .from(contest)
            .where(eq(contest.id, contestId))
            .limit(1);

        if (contestData.length === 0) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        return NextResponse.json(contestData[0]);
    } catch (error) {
        console.error('Error fetching contest:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update contest
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contestId = params.id;
        const body = await request.json();
        const { title, description, startTime, endTime, isPublic } = body;

        // Check if contest exists
        const existingContest = await db
            .select()
            .from(contest)
            .where(eq(contest.id, contestId))
            .limit(1);

        if (existingContest.length === 0) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        // Validation
        if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
            return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
        }

        // Prepare update data
        const updateData: any = {
            updatedAt: new Date()
        };

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (startTime !== undefined) updateData.startTime = new Date(startTime);
        if (endTime !== undefined) updateData.endTime = new Date(endTime);
        if (isPublic !== undefined) updateData.isPublic = isPublic;

        // Update contest
        const updatedContest = await db
            .update(contest)
            .set(updateData)
            .where(eq(contest.id, contestId))
            .returning();

        if (updatedContest.length === 0) {
            throw new Error('Failed to update contest');
        }

        return NextResponse.json(updatedContest[0]);
    } catch (error) {
        console.error('Error updating contest:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete contest
export async function DELETE(
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

        // Delete contest
        await db
            .delete(contest)
            .where(eq(contest.id, contestId));

        return NextResponse.json({ message: 'Contest deleted successfully' });
    } catch (error) {
        console.error('Error deleting contest:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
