import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contest, contestProblem, contestParticipant } from '@/db/schema';
import { desc, and, count, ilike, gte, lte, lt, gt, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';

        const offset = (page - 1) * limit;

        // Build where conditions
        let whereConditions = [];
        if (search) {
            whereConditions.push(ilike(contest.title, `%${search}%`));
        }
        if (status) {
            if (status === 'active') {
                whereConditions.push(and(
                    lte(contest.startTime, new Date()),
                    gte(contest.endTime, new Date())
                ));
            } else if (status === 'upcoming') {
                whereConditions.push(gt(contest.startTime, new Date()));
            } else if (status === 'ended') {
                whereConditions.push(lt(contest.endTime, new Date()));
            }
        }

        // First, get all contests
        const contests = await db
            .select({
                id: contest.id,
                title: contest.title,
                description: contest.description,
                startTime: contest.startTime,
                endTime: contest.endTime,
                isPublic: contest.isPublic,
                createdBy: contest.createdBy,
                createdAt: contest.createdAt,
                updatedAt: contest.updatedAt,
            })
            .from(contest)
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
            .orderBy(desc(contest.createdAt))
            .limit(limit)
            .offset(offset);

        // Get participant and problem counts for each contest
        const contestsWithCounts = await Promise.all(
            contests.map(async (contestData: typeof contests[0]) => {
                const [participantCount] = await db
                    .select({ count: count() })
                    .from(contestParticipant)
                    .where(eq(contestParticipant.contestId, contestData.id));

                const [problemCount] = await db
                    .select({ count: count() })
                    .from(contestProblem)
                    .where(eq(contestProblem.contestId, contestData.id));

                return {
                    ...contestData,
                    participantCount: participantCount?.count || 0,
                    problemCount: problemCount?.count || 0,
                };
            })
        );

        // Get total count for pagination
        const [totalCountResult] = await db
            .select({ count: count() })
            .from(contest)
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

        const totalCount = totalCountResult?.count || 0;

        return NextResponse.json({
            success: true,
            data: {
                contests: contestsWithCounts.map(c => ({
                    ...c,
                    status: getContestStatus(c.startTime, c.endTime)
                })),
                pagination: {
                    page,
                    limit,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching contests:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch contests' },
            { status: 500 }
        );
    }
}

// Helper function to determine contest status
function getContestStatus(startTime: Date, endTime: Date): 'upcoming' | 'active' | 'ended' {
    const now = new Date();
    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'ended';
    return 'active';
}
