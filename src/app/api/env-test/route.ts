import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const hasDatabaseUrl = !!process.env.DATABASE_URL;
        const hasAuthSecret = !!process.env.AUTH_SECRET;

        return NextResponse.json({
            success: true,
            environment: {
                hasDatabaseUrl,
                hasAuthSecret,
                nodeEnv: process.env.NODE_ENV || 'development'
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Failed to check environment'
        }, { status: 500 });
    }
}
