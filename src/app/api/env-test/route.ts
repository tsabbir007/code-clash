import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const envCheck = {
            DATABASE_URL: !!process.env.DATABASE_URL,
            BETTER_AUTH_SECRET: !!process.env.BETTER_AUTH_SECRET,
            NODE_ENV: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        };

        // Check if critical environment variables are missing
        const missingVars = Object.entries(envCheck)
            .filter(([key, value]) => key !== 'NODE_ENV' && key !== 'timestamp' && !value)
            .map(([key]) => key);

        if (missingVars.length > 0) {
            return NextResponse.json({
                success: false,
                error: 'Missing required environment variables',
                missing: missingVars,
                help: 'Please check your .env.local file and ensure all required variables are set',
                envCheck
            }, { status: 503 });
        }

        return NextResponse.json({
            success: true,
            message: 'Environment variables configured correctly',
            envCheck
        });

    } catch (error) {
        console.error('Environment check error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to check environment variables',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
