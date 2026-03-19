import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contest, contestProblem, contestParticipant, contestModerator, user } from '@/db/schema';
import { eq, desc, and, count, ilike, gte, lte, lt, gt } from 'drizzle-orm';

// GET - Fetch all contests
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
            contests.map(async (contestData) => {
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
        });

    } catch (error) {
        console.error('Error fetching contests:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new contest
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, startTime, endTime, isPublic, createdBy } = body;

        // Validation
        if (!title || !startTime || !endTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (new Date(startTime) >= new Date(endTime)) {
            return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
        }

        // Get or create a default user for demo purposes
        let userId = createdBy;
        console.log('Creating contest with createdBy:', createdBy);

        if (!userId) {
            console.log('No createdBy provided, setting up demo user...');
            // Try to get the demo user first
            const demoUser = await db
                .select()
                .from(user)
                .where(eq(user.id, 'admin-user-001'))
                .limit(1);

            if (demoUser.length > 0) {
                userId = demoUser[0].id;
                console.log('Found existing demo user:', userId);
            } else {
                console.log('Demo user not found, checking for any existing users...');
                // Try to get any existing user
                const existingUsers = await db.select().from(user).limit(1);
                if (existingUsers.length > 0) {
                    userId = existingUsers[0].id;
                    console.log('Found existing user:', userId);
                } else {
                    console.log('No users found, creating demo user...');
                    // Create a demo admin user if none exists
                    const [newDemoUser] = await db
                        .insert(user)
                        .values({
                            id: 'admin-user-001',
                            name: 'Admin User',
                            email: 'admin@example.com',
                            image: null,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        })
                        .returning();
                    userId = newDemoUser.id;
                    console.log('Created new demo user:', userId);
                }
            }
        }

        console.log('Using userId for contest creation:', userId);

        // Create contest
        const newContest = await db
            .insert(contest)
            .values({
                title,
                description: description || '',
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                isPublic: isPublic || false,
                createdBy: userId,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning();

        if (newContest.length === 0) {
            throw new Error('Failed to create contest');
        }

        // Add creator as moderator
        await db.insert(contestModerator).values({
            contestId: newContest[0].id,
            userId: userId,
            permissions: 'full',
            addedBy: userId,
            createdAt: new Date()
        });

        return NextResponse.json(newContest[0], { status: 201 });

    } catch (error) {
        console.error('Error creating contest:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper function to determine contest status
function getContestStatus(startTime: Date, endTime: Date): 'upcoming' | 'active' | 'ended' {
    const now = new Date();
    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'ended';
    return 'active';
}
