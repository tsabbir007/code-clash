import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { submission } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { problemId, language, code } = await request.json();

        if (!problemId || !language || !code) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        try {
            const result = await db.insert(submission).values({
                problemId: parseInt(problemId),
                userId: session.user.id,
                language,
                sourceCode: code,
                verdict: 'Running...',
                createdAt: new Date()
            }).returning();

            return NextResponse.json({
                success: true,
                submission: {
                    id: result[0].id,
                    status: 'pending',
                    message: 'Submission received and queued for execution'
                }
            });
        } catch (error) {
            console.error('Error creating submission:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to create submission' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error in submission POST:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get the current session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const problemId = searchParams.get('problemId');
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('perPage') || '10');

        // Build where conditions
        const whereConditions = [eq(submission.userId, session.user.id)];
        if (problemId) {
            whereConditions.push(eq(submission.problemId, parseInt(problemId)));
        }

        // Fetch submissions with pagination
        const submissions = await db
            .select()
            .from(submission)
            .where(sql`${whereConditions[0]} ${problemId ? sql`AND ${whereConditions[1]}` : sql``}`)
            .orderBy(desc(submission.createdAt))
            .limit(perPage)
            .offset((page - 1) * perPage);

        // Get total count for pagination
        const totalResult = await db
            .select({ count: sql`count(*)` })
            .from(submission)
            .where(sql`${whereConditions[0]} ${problemId ? sql`AND ${whereConditions[1]}` : sql``}`);

        const total = (totalResult as any)[0]?.count || 0;

        return NextResponse.json({
            success: true,
            submissions,
            pagination: {
                page,
                perPage,
                total,
                totalPages: Math.ceil(total / perPage),
                hasNextPage: page * perPage < total,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch submissions' },
            { status: 500 }
        );
    }
}
