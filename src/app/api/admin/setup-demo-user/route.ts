import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        // Check if demo user already exists
        const existingDemoUser = await db
            .select()
            .from(user)
            .where(eq(user.id, 'admin-user-001'))
            .limit(1);

        if (existingDemoUser.length > 0) {
            return NextResponse.json({
                message: 'Demo user already exists',
                userId: existingDemoUser[0].id
            });
        }

        // Check if any other users exist
        const existingUsers = await db.select().from(user).limit(1);

        if (existingUsers.length > 0) {
            return NextResponse.json({
                message: 'Users already exist',
                userId: existingUsers[0].id
            });
        }

        // Create a demo admin user with a proper text ID
        const [demoUser] = await db
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

        return NextResponse.json({
            message: 'Demo user created successfully',
            userId: demoUser.id
        }, { status: 201 });

    } catch (error) {
        console.error('Error setting up demo user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
