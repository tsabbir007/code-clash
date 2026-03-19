import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { category } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const categories = await db.select().from(category).orderBy(category.name);

        return NextResponse.json({
            success: true,
            categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('Category creation request received');

        const session = await auth.api.getSession({ headers: request.headers });
        console.log('Auth session:', session);

        if (!session?.user?.id) {
            console.log('No user session found');
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Please log in to create categories' },
                { status: 401 }
            );
        }

        console.log('User authenticated:', session.user.id);

        const body = await request.json();
        console.log('Request body:', body);

        const { name, description, color } = body;

        if (!name || name.trim().length === 0) {
            console.log('Category name validation failed');
            return NextResponse.json(
                { success: false, error: 'Category name is required' },
                { status: 400 }
            );
        }

        console.log('Checking for existing category with name:', name.trim());

        // Check if category already exists
        const existingCategory = await db
            .select()
            .from(category)
            .where(eq(category.name, name.trim()))
            .limit(1);

        if (existingCategory.length > 0) {
            console.log('Category already exists:', existingCategory[0]);
            return NextResponse.json(
                { success: false, error: 'Category with this name already exists' },
                { status: 400 }
            );
        }

        console.log('Creating new category with data:', {
            name: name.trim(),
            description: description?.trim() || null,
            color: color || '#3b82f6'
        });

        const newCategory = await db.insert(category).values({
            name: name.trim(),
            description: description?.trim() || null,
            color: color || '#3b82f6'
        }).returning();

        console.log('Category created successfully:', newCategory[0]);

        return NextResponse.json({
            success: true,
            category: newCategory[0],
            message: 'Category created successfully'
        });
    } catch (error) {
        console.error('Error creating category:', error);

        // More specific error messages
        if (error instanceof Error) {
            if (error.message.includes('connection')) {
                return NextResponse.json(
                    { success: false, error: 'Database connection failed. Please try again.' },
                    { status: 500 }
                );
            }
            if (error.message.includes('permission')) {
                return NextResponse.json(
                    { success: false, error: 'Permission denied. Please check your access rights.' },
                    { status: 403 }
                );
            }
        }

        return NextResponse.json(
            { success: false, error: `Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}
