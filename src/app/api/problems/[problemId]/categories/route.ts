import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { problemCategory, category, problem } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ problemId: string }> }
) {
    try {
        const { problemId } = await params;
        const problemIdNum = parseInt(problemId);

        if (isNaN(problemIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid problem ID' },
                { status: 400 }
            );
        }

        const problemCategories = await db
            .select({
                id: problemCategory.id,
                categoryId: problemCategory.categoryId,
                categoryName: category.name,
                categoryDescription: category.description,
                categoryColor: category.color
            })
            .from(problemCategory)
            .innerJoin(category, eq(problemCategory.categoryId, category.id))
            .where(eq(problemCategory.problemId, problemIdNum));

        return NextResponse.json({
            success: true,
            categories: problemCategories
        });
    } catch (error) {
        console.error('Error fetching problem categories:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch problem categories' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ problemId: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { problemId } = await params;
        const problemIdNum = parseInt(problemId);

        if (isNaN(problemIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid problem ID' },
                { status: 400 }
            );
        }

        const { categoryId } = await request.json();

        if (!categoryId) {
            return NextResponse.json(
                { success: false, error: 'Category ID is required' },
                { status: 400 }
            );
        }

        // Check if problem exists
        const problemExists = await db
            .select()
            .from(problem)
            .where(eq(problem.id, problemIdNum))
            .limit(1);

        if (problemExists.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Problem not found' },
                { status: 404 }
            );
        }

        // Check if category exists
        const categoryExists = await db
            .select()
            .from(category)
            .where(eq(category.id, categoryId))
            .limit(1);

        if (categoryExists.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Category not found' },
                { status: 404 }
            );
        }

        // Check if problem-category relationship already exists
        const existingRelation = await db
            .select()
            .from(problemCategory)
            .where(and(
                eq(problemCategory.problemId, problemIdNum),
                eq(problemCategory.categoryId, categoryId)
            ))
            .limit(1);

        if (existingRelation.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Category is already assigned to this problem' },
                { status: 400 }
            );
        }

        const newProblemCategory = await db.insert(problemCategory).values({
            problemId: problemIdNum,
            categoryId
        }).returning();

        return NextResponse.json({
            success: true,
            problemCategory: newProblemCategory[0],
            message: 'Category assigned to problem successfully'
        });
    } catch (error) {
        console.error('Error assigning category to problem:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to assign category to problem' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ problemId: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { problemId } = await params;
        const problemIdNum = parseInt(problemId);

        if (isNaN(problemIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid problem ID' },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');

        if (!categoryId) {
            return NextResponse.json(
                { success: false, error: 'Category ID is required' },
                { status: 400 }
            );
        }

        const deletedProblemCategory = await db
            .delete(problemCategory)
            .where(and(
                eq(problemCategory.problemId, problemIdNum),
                eq(problemCategory.categoryId, parseInt(categoryId))
            ))
            .returning();

        if (deletedProblemCategory.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Problem-category relationship not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Category removed from problem successfully'
        });
    } catch (error) {
        console.error('Error removing category from problem:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to remove category from problem' },
            { status: 500 }
        );
    }
}
