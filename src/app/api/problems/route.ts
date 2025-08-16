import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { problem, user, problemCategory, category } from '@/db/schema';
import { auth } from '@/lib/auth-server';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        // Get current user from session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name } = await request.json();

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Problem name is required' },
                { status: 400 }
            );
        }

        console.log('Creating new problem:', name, 'for user:', session.user.id);

        // Create new problem with auto-generated ID
        const newProblem = await db
            .insert(problem)
            .values({
                title: name.trim(),
                statement: null, // Will be set later
                userId: session.user.id,
                timeLimit: 1000, // Default 1 second
                memoryLimit: 256, // Default 256KB
                checkerType: 'fcmp', // Default checker
            })
            .returning();

        console.log('Problem created successfully:', newProblem[0]);

        return NextResponse.json({
            success: true,
            message: 'Problem created successfully!',
            problem: newProblem[0]
        });

    } catch (error) {
        console.error('Error creating problem:', error);
        return NextResponse.json(
            { error: 'Failed to create problem' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get current user from session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get pagination parameters from query string
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('perPage') || '10');

        // Validate pagination parameters
        if (page < 1 || perPage < 1 || perPage > 100) {
            return NextResponse.json(
                { error: 'Invalid pagination parameters' },
                { status: 400 }
            );
        }

        // Calculate offset
        const offset = (page - 1) * perPage;

        // Get total count of problems
        const totalResult = await db.execute(
            'SELECT COUNT(*) as total FROM problem'
        );
        const total = (totalResult as any)[0]?.total || 0;

        // Get problems with user information and categories (paginated)
        const problems = await db
            .select({
                id: problem.id,
                title: problem.title,
                description: problem.description,
                difficulty: problem.difficulty,
                statement: problem.statement,
                timeLimit: problem.timeLimit,
                memoryLimit: problem.memoryLimit,
                checkerType: problem.checkerType,
                createdAt: problem.createdAt,
                updatedAt: problem.updatedAt,
                userName: user.name,
                userEmail: user.email,
            })
            .from(problem)
            .leftJoin(user, eq(problem.userId, user.id))
            .orderBy(problem.createdAt)
            .limit(perPage)
            .offset(offset);

        // Get categories for each problem
        const problemsWithCategories = await Promise.all(
            problems.map(async (problemData: any) => {
                const problemCategories = await db
                    .select({
                        categoryId: problemCategory.categoryId,
                    })
                    .from(problemCategory)
                    .where(eq(problemCategory.problemId, problemData.id));

                return {
                    ...problemData,
                    categories: problemCategories.map((pc: any) => pc.categoryId)
                };
            })
        );

        return NextResponse.json({
            success: true,
            problems: problemsWithCategories,
            pagination: {
                page,
                perPage,
                total,
                totalPages: Math.ceil(total / perPage),
                hasNextPage: page < Math.ceil(total / perPage),
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching problems:', error);
        return NextResponse.json(
            { error: 'Failed to fetch problems' },
            { status: 500 }
        );
    }
} 