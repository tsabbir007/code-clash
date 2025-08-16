import { auth, authError } from "@/lib/auth-server";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

// Helper function to check if auth is available
function isAuthAvailable() {
    return auth && !authError;
}

// Helper function to get error response
function getAuthErrorResponse() {
    const errorMessage = authError || "Authentication not configured";
    return NextResponse.json({
        success: false,
        error: 'Authentication service not available',
        details: errorMessage,
        help: 'Please check your environment variables and restart the server'
    }, { status: 503 });
}

export async function POST(request: Request) {
    // Check if auth is properly configured
    if (!isAuthAvailable()) {
        return getAuthErrorResponse();
    }

    try {
        const { POST: authPost } = toNextJsHandler(auth);
        return await authPost(request);
    } catch (error) {
        console.error('Auth POST error:', error);

        // Check for specific error types
        if (error instanceof Error) {
            if (error.message.includes('AUTH_SECRET')) {
                return NextResponse.json({
                    success: false,
                    error: 'Authentication secret not configured',
                    details: 'AUTH_SECRET environment variable is missing',
                    help: 'Add AUTH_SECRET to your .env.local file and restart the server'
                }, { status: 500 });
            }

            if (error.message.includes('DATABASE_URL')) {
                return NextResponse.json({
                    success: false,
                    error: 'Database not configured',
                    details: 'DATABASE_URL environment variable is missing',
                    help: 'Add DATABASE_URL to your .env.local file and restart the server'
                }, { status: 500 });
            }
        }

        return NextResponse.json({
            success: false,
            error: 'Authentication service error',
            details: error instanceof Error ? error.message : 'Unknown error',
            help: 'Check the server logs for more details'
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    // Check if auth is properly configured
    if (!isAuthAvailable()) {
        return getAuthErrorResponse();
    }

    try {
        const { GET: authGet } = toNextJsHandler(auth);
        return await authGet(request);
    } catch (error) {
        console.error('Auth GET error:', error);

        return NextResponse.json({
            success: false,
            error: 'Authentication service error',
            details: error instanceof Error ? error.message : 'Unknown error',
            help: 'Check the server logs for more details'
        }, { status: 500 });
    }
}