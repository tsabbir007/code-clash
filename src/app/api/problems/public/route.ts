import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { problem, user, problemCategory, category } from '@/db/schema';
import { eq, and, like, inArray, or, desc, ilike } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('perPage') || '10');
        const selectedCategory = searchParams.get('category');
        const selectedDifficulty = searchParams.get('difficulty');
        const searchQuery = searchParams.get('search') || '';

        // Validate pagination parameters
        if (page < 1 || perPage < 1 || perPage > 100) {
            return NextResponse.json(
                { error: 'Invalid pagination parameters' },
                { status: 400 }
            );
        }

        // Calculate offset
        const offset = (page - 1) * perPage;

        // Build where conditions for the main problem query
        let whereConditions = [];

        if (selectedDifficulty && selectedDifficulty !== 'All') {
            // Case-insensitive difficulty matching using ilike
            whereConditions.push(ilike(problem.difficulty, selectedDifficulty));
        }

        // Handle category filtering - we need to join with problemCategory and category tables
        let categoryJoinRequired = false;
        if (selectedCategory && selectedCategory !== 'All') {
            categoryJoinRequired = true;
        }

        // Handle search query - search in title, description, and category names
        if (searchQuery) {
            // If we need category filtering, we'll handle search differently
            if (categoryJoinRequired) {
                // Search will be handled in the joined query with category filtering
                // We'll add search conditions to the category join query
            } else {
                // Search in title and description with case-insensitive matching
                whereConditions.push(
                    or(
                        ilike(problem.title, `%${searchQuery}%`),
                        ilike(problem.description, `%${searchQuery}%`)
                    )
                );
            }
        }

        // Get total count with proper filtering
        let totalQuery;
        if (categoryJoinRequired) {
            // Use a subquery to get problems that match the category
            let categoryWhereConditions = [eq(category.name, selectedCategory)];

            // Add search conditions if search query exists
            if (searchQuery) {
                categoryWhereConditions.push(
                    or(
                        ilike(problem.title, `%${searchQuery}%`),
                        ilike(problem.description, `%${searchQuery}%`)
                    )
                );
            }

            totalQuery = db
                .select({ count: problem.id })
                .from(problem)
                .innerJoin(problemCategory, eq(problem.id, problemCategory.problemId))
                .innerJoin(category, eq(problemCategory.categoryId, category.id))
                .where(
                    and(
                        ...whereConditions,
                        ...categoryWhereConditions
                    )
                );
        } else {
            totalQuery = db
                .select({ count: problem.id })
                .from(problem)
                .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
        }

        const totalProblems = await totalQuery;
        const total = totalProblems.length;

        // Get problems with proper filtering and pagination
        let problemsQuery;
        if (categoryJoinRequired) {
            // Query with category join
            problemsQuery = db
                .select({
                    id: problem.id,
                    title: problem.title,
                    description: problem.description,
                    difficulty: problem.difficulty,
                    timeLimit: problem.timeLimit,
                    memoryLimit: problem.memoryLimit,
                    createdAt: problem.createdAt,
                    userName: user.name,
                })
                .from(problem)
                .innerJoin(problemCategory, eq(problem.id, problemCategory.problemId))
                .innerJoin(category, eq(problemCategory.categoryId, category.id))
                .leftJoin(user, eq(problem.userId, user.id))
                .where(
                    and(
                        ...whereConditions,
                        eq(category.name, selectedCategory)
                    )
                )
                .orderBy(desc(problem.createdAt))
                .limit(perPage)
                .offset(offset);
        } else {
            // Standard query without category join
            problemsQuery = db
                .select({
                    id: problem.id,
                    title: problem.title,
                    description: problem.description,
                    difficulty: problem.difficulty,
                    timeLimit: problem.timeLimit,
                    memoryLimit: problem.memoryLimit,
                    createdAt: problem.createdAt,
                    userName: user.name,
                })
                .from(problem)
                .leftJoin(user, eq(problem.userId, user.id))
                .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
                .orderBy(desc(problem.createdAt))
                .limit(perPage)
                .offset(offset);
        }

        const problems = await problemsQuery;

        // Get categories for each problem
        const problemsWithCategories = await Promise.all(
            problems.map(async (problemData) => {
                const problemCategories = await db
                    .select({
                        categoryId: problemCategory.categoryId,
                        categoryName: category.name,
                        color: category.color,
                    })
                    .from(problemCategory)
                    .leftJoin(category, eq(problemCategory.categoryId, category.id))
                    .where(eq(problemCategory.problemId, problemData.id));

                return {
                    ...problemData,
                    categories: problemCategories.map(pc => ({
                        id: pc.categoryId,
                        name: pc.categoryName,
                        color: pc.color
                    }))
                };
            })
        );

        // Get all available categories for filtering
        const allCategories = await db
            .select({
                id: category.id,
                name: category.name,
                color: category.color,
            })
            .from(category)
            .orderBy(category.name);

        // Get all available difficulties
        const difficulties = ['Easy', 'Medium', 'Hard'];

        return NextResponse.json({
            success: true,
            problems: problemsWithCategories,
            categories: allCategories,
            difficulties,
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
        console.error('Error fetching public problems:', error);
        return NextResponse.json(
            { error: 'Failed to fetch problems' },
            { status: 500 }
        );
    }
}
