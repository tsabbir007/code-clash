import { NextResponse } from 'next/server';
import { auth, authError } from '@/lib/auth-server';

export async function GET() {
    try {
        // Check if auth is properly configured
        if (!auth || authError) {
            return NextResponse.json({
                success: false,
                error: 'Authentication not configured',
                details: authError || 'Environment variables missing',
                help: 'Please create a .env.local file with DATABASE_URL and AUTH_SECRET, then restart the server',
                config: {
                    hasSecret: !!process.env.BETTER_AUTH_SECRET,
                    hasDatabaseUrl: !!process.env.DATABASE_URL,
                    authInstance: !!auth,
                    authError: authError,
                    nodeEnv: process.env.NODE_ENV || 'development'
                }
            }, { status: 503 });
        }

        // Test if auth is properly configured
        const authConfig = {
            hasSecret: !!process.env.BETTER_AUTH_SECRET,
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            authInstance: !!auth,
            nodeEnv: process.env.NODE_ENV || 'development'
        };

        return NextResponse.json({
            success: true,
            message: 'Auth configuration test',
            config: authConfig
        });
    } catch (error) {
        console.error('Auth test error:', error);

        return NextResponse.json({
            success: false,
            error: 'Auth configuration failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            help: 'Check the server logs for more details'
        }, { status: 500 });
    }
}
