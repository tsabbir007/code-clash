import { NextResponse } from 'next/server';
import { db } from '@/db';
import { testCase, problem } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        // Check problem 1
        const problem1 = await db
            .select()
            .from(problem)
            .where(eq(problem.id, 1))
            .limit(1);

        // Get all test cases for problem 1
        const testCases = await db
            .select()
            .from(testCase)
            .where(eq(testCase.problemId, 1));

        // Get sample test cases for problem 1
        const sampleTestCases = await db
            .select()
            .from(testCase)
            .where(eq(testCase.problemId, 1));

        return NextResponse.json({
            success: true,
            problem1: problem1[0] || null,
            allTestCases: testCases,
            sampleTestCases: sampleTestCases,
            totalTestCases: testCases.length,
            totalSampleTestCases: sampleTestCases.length
        });
    } catch (error) {
        console.error('Error checking test cases:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to check test cases',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
