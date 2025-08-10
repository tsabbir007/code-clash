import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { solution, testCase, problem } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// Language IDs for Judge0 API
const LANGUAGE_IDS: Record<string, number> = {
    python: 71, // Python (3.8.1)
    javascript: 63, // JavaScript (Node.js 12.14.0)
    java: 62, // Java (OpenJDK 13.0.1)
    cpp: 54, // C++ (GCC 9.2.0)
    c: 50, // C (GCC 9.2.0)
    csharp: 51, // C# (Mono 6.6.0.161)
    ruby: 72, // Ruby (2.7.0)
    go: 60, // Go (1.13.5)
    rust: 73, // Rust (1.40.0)
};

const JUDGE0_API_ENDPOINT = process.env.NEXT_PUBLIC_JUDGE0_API_ENDPOINT || 'http://localhost:2358';

interface Judge0Submission {
    id: string;
    status: {
        id: number;
        description: string;
    };
    stdout: string;
    stderr: string;
    time: string;
    memory: number;
    compile_output: string;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ problem_id: string; solution_id: string }> }
) {
    try {
        const { problem_id, solution_id } = await params;

        // Get current user from session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get solution and problem details
        const solutions = await db
            .select()
            .from(solution)
            .where(
                and(
                    eq(solution.id, parseInt(solution_id)),
                    eq(solution.problemId, parseInt(problem_id))
                )
            );

        if (solutions.length === 0) {
            return NextResponse.json(
                { error: 'Solution not found' },
                { status: 404 }
            );
        }

        const solutionData = solutions[0];

        // Get all test cases for this problem
        const testCases = await db
            .select()
            .from(testCase)
            .where(eq(testCase.problemId, parseInt(problem_id)));

        if (testCases.length === 0) {
            return NextResponse.json(
                { error: 'No test cases found for this problem' },
                { status: 400 }
            );
        }

        // Get problem details for limits
        const problems = await db
            .select()
            .from(problem)
            .where(eq(problem.id, parseInt(problem_id)));

        if (problems.length === 0) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        const problemData = problems[0];
        const languageId = LANGUAGE_IDS[solutionData.language];

        if (!languageId) {
            return NextResponse.json(
                { error: 'Unsupported language' },
                { status: 400 }
            );
        }

        // Execute against each test case
        const results = [];
        let passedTests = 0;
        let totalTests = testCases.length;
        let maxTime = 0;
        let maxMemory = 0;

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            try {
                // Submit to Judge0
                const submitResponse = await fetch(`${JUDGE0_API_ENDPOINT}/submissions?base64_encoded=false&wait=true`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        language_id: languageId,
                        source_code: solutionData.sourceCode,
                        stdin: testCase.input,
                        expected_output: testCase.output,
                        cpu_time_limit: Math.min(Math.floor((problemData.timeLimit || 1000) / 1000), 10), // Convert to seconds, cap at 10 seconds
                        memory_limit: Math.min((problemData.memoryLimit || 256) * 1024, 512000), // Convert to bytes, cap at 512KB
                    }),
                });

                if (!submitResponse.ok) {
                    const errorText = await submitResponse.text();
                    console.error('Judge0 API Error:', errorText);
                    console.error('Judge0 URL:', `${JUDGE0_API_ENDPOINT}/submissions?base64_encoded=false&wait=true`);
                    console.error('Request body:', JSON.stringify({
                        language_id: languageId,
                        source_code: solutionData.sourceCode.substring(0, 100) + '...',
                        stdin: testCase.input,
                        expected_output: testCase.output,
                        cpu_time_limit: Math.floor((problemData.timeLimit || 1000) / 1000),
                        memory_limit: (problemData.memoryLimit || 256) * 1024,
                    }));
                    results.push({
                        testCaseId: testCase.id,
                        testCaseLabel: testCase.label,
                        verdict: 'RE',
                        cpuTime: 0,
                        memoryUsage: 0,
                        error: `Failed to submit to Judge0: ${errorText}`,
                        status: 'error'
                    });
                    continue;
                }

                const result: Judge0Submission = await submitResponse.json();
                console.log('Judge0 Response:', JSON.stringify(result, null, 2));

                // Process the result
                let verdict = 'AC';
                let cpuTime = 0;
                let memoryUsage = 0;
                let error = null;

                if (result.status?.id === 3) {
                    // Status 3 = Accepted (successful execution)
                    verdict = 'AC';
                    cpuTime = parseFloat(result.time || '0') * 1000; // Convert to milliseconds
                    memoryUsage = Math.round((result.memory || 0) / 1024); // Convert to KB
                    passedTests++;
                } else if (result.status?.id === 4) {
                    // Status 4 = Wrong Answer
                    verdict = 'WA';
                } else if (result.status?.id === 5) {
                    // Status 5 = Time Limit Exceeded
                    verdict = 'TLE';
                } else if (result.status?.id === 6) {
                    // Status 6 = Compilation Error
                    verdict = 'CE';
                    error = result.compile_output || 'Compilation error';
                } else if (result.status?.id === 7) {
                    // Status 7 = Runtime Error
                    verdict = 'RE';
                    error = result.stderr || 'Runtime error';
                } else if (result.status?.id === 8) {
                    // Status 8 = Memory Limit Exceeded
                    verdict = 'MLE';
                } else {
                    // Other errors
                    verdict = 'RE';
                    error = result.stderr || 'Unknown error';
                }

                // Update max time and memory
                if (cpuTime > maxTime) maxTime = cpuTime;
                if (memoryUsage > maxMemory) maxMemory = memoryUsage;

                results.push({
                    testCaseId: testCase.id,
                    testCaseLabel: testCase.label,
                    verdict,
                    cpuTime: Math.round(cpuTime),
                    memoryUsage,
                    error,
                    status: 'completed'
                });

            } catch (error) {
                console.error('Error executing test case:', error);
                results.push({
                    testCaseId: testCase.id,
                    testCaseLabel: testCase.label,
                    verdict: 'RE',
                    cpuTime: 0,
                    memoryUsage: 0,
                    error: 'Execution failed',
                    status: 'error'
                });
            }
        }

        // Determine overall verdict
        const overallVerdict = passedTests === totalTests ? 'AC' : 'WA';

        // Update solution with results
        const updatedSolutions = await db
            .update(solution)
            .set({
                verdict: overallVerdict,
                cpuTime: Math.round(maxTime),
                memoryUsage: maxMemory,
            })
            .where(
                and(
                    eq(solution.id, parseInt(solution_id)),
                    eq(solution.problemId, parseInt(problem_id))
                )
            )
            .returning();

        return NextResponse.json({
            success: true,
            message: `Execution completed! ${passedTests}/${totalTests} test cases passed.`,
            results: {
                overallVerdict,
                passedTests,
                totalTests,
                maxTime: Math.round(maxTime),
                maxMemory,
                testCaseResults: results
            },
            solution: updatedSolutions[0]
        });

    } catch (error) {
        console.error('Error executing solution:', error);
        return NextResponse.json(
            { error: 'Failed to execute solution' },
            { status: 500 }
        );
    }
} 