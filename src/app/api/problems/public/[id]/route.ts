import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { problem, user, problemCategory, category, testCase } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check if params exists and await it
        if (!params) {
            return NextResponse.json(
                { error: 'Invalid request parameters' },
                { status: 400 }
            );
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Problem ID is required' },
                { status: 400 }
            );
        }

        const problemId = parseInt(id);

        if (isNaN(problemId)) {
            return NextResponse.json(
                { error: 'Invalid problem ID' },
                { status: 400 }
            );
        }

        // Get problem details
        const problemData = await db
            .select({
                id: problem.id,
                title: problem.title,
                statement: problem.statement,
                description: problem.description,
                difficulty: problem.difficulty,
                timeLimit: problem.timeLimit,
                memoryLimit: problem.memoryLimit,
                checkerType: problem.checkerType,
                createdAt: problem.createdAt,
                userName: user.name,
            })
            .from(problem)
            .leftJoin(user, eq(problem.userId, user.id))
            .where(eq(problem.id, problemId))
            .limit(1);

        if (!problemData || problemData.length === 0) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        const problemInfo = problemData[0];

        // Get categories for the problem
        const problemCategories = await db
            .select({
                categoryId: problemCategory.categoryId,
                categoryName: category.name,
                categoryColor: category.color,
            })
            .from(problemCategory)
            .leftJoin(category, eq(problemCategory.categoryId, category.id))
            .where(eq(problemCategory.problemId, problemId));

        // Get all test cases for the problem
        const allTestCases = await db
            .select({
                id: testCase.id,
                label: testCase.label,
                input: testCase.input,
                output: testCase.output,
                points: testCase.points,
                isSample: testCase.isSample,
            })
            .from(testCase)
            .where(eq(testCase.problemId, problemId))
            .orderBy(testCase.id);

        return NextResponse.json({
            success: true,
            problem: {
                ...problemInfo,
                categories: problemCategories?.map(pc => ({
                    id: pc.categoryId,
                    name: pc.categoryName,
                    color: pc.categoryColor
                })) || [],
                allTestCases: allTestCases || []
            }
        });

    } catch (error) {
        console.error('Error fetching problem:', error);
        return NextResponse.json(
            { error: 'Failed to fetch problem' },
            { status: 500 }
        );
    }
}
