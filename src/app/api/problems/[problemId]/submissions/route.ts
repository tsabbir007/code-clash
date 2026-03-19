import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submission, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, like, desc } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ problemId: string }> }
) {
    try {
        const { problemId } = await params;
        const { searchParams } = new URL(request.url);

        // Get current user from session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get filter parameters
        const handle = searchParams.get('handle') || '';
        const language = searchParams.get('language') || '';
        const verdict = searchParams.get('verdict') || '';

        // Build query with filters
        let query = db
            .select({
                id: submission.id,
                when: submission.createdAt,
                author: user.name,
                type: submission.type,
                language: submission.language,
                cpuTime: submission.cpuTime,
                memoryUsage: submission.memoryUsage,
                verdict: submission.verdict,
                sourceCode: submission.sourceCode,
            })
            .from(submission)
            .leftJoin(user, eq(submission.userId, user.id))
            .where(eq(submission.problemId, parseInt(problemId)))
            .orderBy(desc(submission.createdAt));

        // Apply filters
        //TODO: Fix this
        if (handle) {
            query = query.where(like(user.name, `%${handle}%`));
        }
        if (language) {
            query = query.where(eq(submission.language, language));
        }
        if (verdict) {
            query = query.where(eq(submission.verdict, verdict));
        }

        const submissions = await query;

        return NextResponse.json({
            success: true,
            submissions
        });

    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch submissions' },
            { status: 500 }
        );
    }
} 