"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from "@/components/navbar/navbar"
import { CodeEditor, ProblemStatement, SubmissionResult, SubmissionHistory } from "@/components/problem"
import { Button } from "@/components/ui/button"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Loader, AlertTriangle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TestCaseResult {
    id: number;
    label: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    executionTime?: number;
    memoryUsage?: number;   
    error?: string;
}

interface SubmissionResult {
    id: string;
    timestamp: Date;
    language: string;
    code: string;
    verdict: string;
    testCasesPassed: number;
    totalTestCases: number;
    score: number;
    totalScore: number;
    cpuTime: number;
    memoryUsage: number;
    executionTime: number;
    memoryUsed: number;
    testCaseResults: TestCaseResult[];
}

interface Problem {
    id: number;
    title: string;
    statement: string;
    difficulty: string;
    timeLimit: number;
    memoryLimit: number;
    categories: Array<{
        id: number;
        name: string;
        color: string;
    }>;
    allTestCases: Array<{
        id: number;
        label: string;
        input: string;
        output: string;
        points: number;
        isSample: boolean;
    }>;
    userName: string;
}

export default function ProblemPage() {
    const params = useParams()
    const problemId = params.problemId as string

    const [problem, setProblem] = useState<Problem | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [code, setCode] = useState("")
    const [language, setLanguage] = useState("cpp")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isExecuting, setIsExecuting] = useState(false)
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
    const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [viewingCode, setViewingCode] = useState<string | null>(null);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/submissions', { method: 'GET' });
            setIsAuthenticated(response.status !== 401);
        } catch (error) {
            setIsAuthenticated(false);
        }
    };

    const loadProblem = async () => {
        try {
            setIsLoading(true)
            console.log('Loading problem with ID:', problemId);

            const response = await fetch(`/api/problems/public/${problemId}`)
            const data = await response.json()

            if (data.success) {
                console.log('Problem loaded successfully:', data.problem);
                console.log('All test cases found:', data.problem.allTestCases);
                console.log('Number of test cases:', data.problem.allTestCases?.length || 0);

                setProblem(data.problem)
            } else {
                console.error('Failed to load problem:', data.error)
            }
        } catch (error) {
            console.error('Error loading problem:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const loadSubmissions = async () => {
        try {
            const response = await fetch(`/api/submissions?problemId=${problemId}`);
            const data = await response.json();

            if (data.success) {
                // Transform API submissions to match our interface
                const transformedSubmissions: SubmissionResult[] = data.submissions.map((sub: any) => ({
                    id: sub.id.toString(),
                    timestamp: new Date(sub.createdAt),
                    language: sub.language,
                    code: sub.sourceCode,
                    verdict: sub.verdict || 'Pending',
                    testCasesPassed: sub.testCasesPassed || 0,
                    totalTestCases: sub.totalTestCases || (problem?.allTestCases?.length || 0),
                    score: sub.score || 0,
                    totalScore: (problem?.allTestCases?.length || 0) * 10,
                    cpuTime: sub.cpuTime || 0,
                    memoryUsage: sub.memoryUsage || 0,
                    executionTime: sub.cpuTime || 0,
                    memoryUsed: sub.memoryUsage || 0,
                    testCaseResults: []
                }));

                // Clean up any submissions that might be stuck in "Running..." state
                const cleanedSubmissions = transformedSubmissions.map(sub => {
                    if (sub.verdict === 'Running...' || sub.verdict === 'Pending') {
                        const submissionAge = Date.now() - sub.timestamp.getTime();
                        if (submissionAge > 5 * 60 * 1000) {
                            return {
                                ...sub,
                                verdict: 'System Error',
                                error: 'Submission timed out'
                            };
                        }
                    }
                    return sub;
                });

                setSubmissions(cleanedSubmissions);
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
        }
    };

    const handleSubmit = async () => {
        if (!code.trim()) {
            alert('Please enter your code');
            return;
        }

        console.log('Submitting solution...');
        console.log('Problem data:', problem);
        console.log('All test cases:', problem?.allTestCases);

        setIsSubmitting(true);

        try {
            // Submit to real API
            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    problemId: parseInt(problemId),
                    language,
                    code
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert('Please log in to submit code.');
                    return;
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    alert(`Submission failed: ${errorData.error || 'Unknown error'}`);
                    return;
                }
            }

            const data = await response.json();

            if (data.success) {
                // Create a solution record for execution
                const solutionResponse = await fetch(`/api/problems/${problemId}/solutions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        label: `User Solution ${new Date().toLocaleTimeString()}`,
                        note: 'User submitted solution',
                        language,
                        sourceCode: code
                    })
                });

                if (!solutionResponse.ok) {
                    throw new Error('Failed to create solution for execution');
                }

                const solutionData = await solutionResponse.json();
                const solutionId = solutionData.solution.id;

                // Create test case results from the problem's all test cases
                const testCaseResults: TestCaseResult[] = (problem?.allTestCases || []).map(tc => ({
                    id: tc.id,
                    label: tc.label,
                    status: 'pending',
                    input: tc.input,
                    expectedOutput: tc.output,
                    executionTime: 0,
                    memoryUsage: 0
                }));

                console.log(`Created ${testCaseResults.length} test case results:`, testCaseResults);

                // Create a new submission result for immediate display
                const newSubmission: SubmissionResult = {
                    id: data.submission.id.toString(),
                    timestamp: new Date(),
                    language,
                    code,
                    verdict: 'Running...',
                    testCasesPassed: 0,
                    totalTestCases: testCaseResults.length,
                    score: 0,
                    totalScore: testCaseResults.length, // Just use total test case count
                    cpuTime: 0,
                    memoryUsage: 0,
                    executionTime: 0,
                    memoryUsed: 0,
                    testCaseResults: testCaseResults
                };

                console.log('New submission created:', newSubmission);

                setSubmissionResult(newSubmission);
                setSubmissions(prev => [newSubmission, ...prev]);

                try {
                    setIsExecuting(true);

                    const executionUrl = `/api/problems/${problemId}/solutions/${solutionId}/execute`;
                    console.log('Debug - Execution URL:', executionUrl);
                    console.log('Debug - problemId:', problemId);
                    console.log('Debug - solutionId:', solutionId);

                    const executionResponse = await fetch(executionUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (!executionResponse.ok) {
                        throw new Error(`Execution failed: ${executionResponse.statusText}`);
                    }

                    const executionData = await executionResponse.json();

                    if (executionData.success) {
                        // Transform the execution results to match our interface
                        const transformedTestCases: TestCaseResult[] = executionData.results.testCaseResults.map((tc: any) => ({
                            id: tc.testCaseId,
                            label: tc.testCaseLabel,
                            status: tc.verdict === 'AC' ? 'passed' : 'failed',
                            input: '',
                            expectedOutput: '',
                            actualOutput: tc.verdict === 'AC' ? 'Correct' : 'Incorrect',
                            executionTime: tc.cpuTime,
                            memoryUsage: tc.memoryUsage,
                            error: tc.error
                        }));

                        // Calculate score based on passed test cases (simple ratio)
                        const passedCount = executionData.results.passedTests;
                        const totalCount = executionData.results.totalTests;
                        const score = passedCount; // Score is just the number of passed test cases

                        // Update submission result with real execution data
                        const finalSubmission = {
                            ...newSubmission,
                            verdict: executionData.results.overallVerdict === 'AC' ? 'Accepted' : 'Wrong Answer',
                            score: score,
                            totalScore: totalCount, // Total score is total test cases
                            cpuTime: executionData.results.maxTime,
                            memoryUsage: executionData.results.maxMemory,
                            testCasesPassed: passedCount,
                            totalTestCases: totalCount,
                            executionTime: executionData.results.maxTime,
                            memoryUsed: executionData.results.maxMemory,
                            testCaseResults: transformedTestCases
                        };

                        setSubmissionResult(finalSubmission);

                        // Update the submission in the local submissions array
                        setSubmissions(prev => prev.map(sub =>
                            sub.id === newSubmission.id ? finalSubmission : sub
                        ));

                        // Update the submission in the API with the final results
                        const updateResponse = await fetch(`/api/submissions/${data.submission.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                verdict: finalSubmission.verdict,
                                score: finalSubmission.score,
                                cpuTime: finalSubmission.cpuTime,
                                memoryUsage: finalSubmission.memoryUsage,
                                testCasesPassed: finalSubmission.testCasesPassed,
                                totalTestCases: finalSubmission.totalTestCases
                            })
                        });

                        if (!updateResponse.ok) {
                            console.error('Failed to update submission:', await updateResponse.text());
                        }

                        console.log('Execution completed successfully:', executionData);
                    } else {
                        throw new Error(executionData.error || 'Execution failed');
                    }
                } catch (executionError) {
                    console.error('Execution error:', executionError);

                    // Mark submission as failed due to execution error
                    const failedSubmission = {
                        ...newSubmission,
                        verdict: 'System Error',
                        error: `Execution failed: ${executionError instanceof Error ? executionError.message : 'Unknown error'}`
                    };

                    setSubmissionResult(failedSubmission);
                    setSubmissions(prev => prev.map(sub =>
                        sub.id === newSubmission.id ? failedSubmission : sub
                    ));

                    // Update the submission in the API
                    const updateResponse = await fetch(`/api/submissions/${data.submission.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            verdict: 'System Error',
                            error: `Execution failed: ${executionError instanceof Error ? executionError.message : 'Unknown error'}`
                        })
                    });

                    if (!updateResponse.ok) {
                        console.error('Failed to update submission:', await updateResponse.text());
                    }
                } finally {
                    setIsExecuting(false);
                }
            } else {
                alert(`Submission failed: ${data.error}`);
            }
        } catch (error) {
            console.error('Error submitting code:', error);
            if (error instanceof Error && error.message.includes('Unauthorized')) {
                alert('Please log in to submit code.');
            } else {
                alert('Failed to submit code. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewCode = (code: string) => {
        setViewingCode(code);
    };

    const handleViewSubmission = (submission: SubmissionResult) => {
        setSubmissionResult(submission);
        // Scroll to submission result
        setTimeout(() => {
            const element = document.getElementById('submission-result');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    useEffect(() => {
        if (problemId) {
            loadProblem();
            checkAuthStatus();
        }
    }, [problemId]);

    // Load submissions when problem is loaded
    useEffect(() => {
        if (problem && !isLoading) {
            loadSubmissions();
        }
    }, [problem, isLoading]);

    // Periodic cleanup of stuck submissions
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            setSubmissions(prev => prev.map(sub => {
                if (sub.verdict === 'Running...' || sub.verdict === 'Pending') {
                    const submissionAge = Date.now() - sub.timestamp.getTime();
                    if (submissionAge > 5 * 60 * 1000) {
                        return {
                            ...sub,
                            verdict: 'System Error',
                            error: 'Submission timed out'
                        };
                    }
                }
                return sub;
            }));
        }, 60000);

        return () => clearInterval(cleanupInterval);
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center space-y-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading Problem</h2>
                            <p className="text-gray-500 dark:text-gray-400">Preparing your coding environment...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center space-y-6 max-w-md mx-auto px-6">
                        <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Problem Not Found</h1>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                The problem you're looking for doesn't exist or may have been removed.
                            </p>
                        </div>
                        <Link
                            href="/problems"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
                        >
                            Browse Problems
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <div className="flex-1 mx-auto w-full">
                {/* Page Header */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl shadow-lg">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                {problem.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                                <span className="flex items-center gap-3 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-blue-200/60 dark:border-blue-700/40 shadow-sm">
                                    <div className={`w-3 h-3 rounded-full ${problem.difficulty === 'Easy' ? 'bg-green-500' :
                                        problem.difficulty === 'Medium' ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}></div>
                                    <span className="font-medium">{problem.difficulty}</span>
                                </span>
                                <span className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-blue-200/60 dark:border-blue-700/40 shadow-sm">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-medium">{problem.timeLimit}ms</span>
                                </span>
                                <span className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-blue-200/60 dark:border-blue-700/40 shadow-sm">
                                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                                    <span className="font-medium">{problem.memoryLimit}MB</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {problem.categories.map((category) => (
                                <span
                                    key={category.id}
                                    className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg border border-blue-200/60 dark:border-blue-700/40 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    {category.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="h-[calc(100vh-120px)] sm:h-[calc(100vh-100px)] border border-gray-200/60 dark:border-gray-700/60 rounded-2xl bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                        {/* Left Panel: Problem Statement */}
                        <ResizablePanel defaultSize={50} minSize={35} className="relative">
                            <div className="h-full flex flex-col">
                                <div className="flex-shrink-0 p-6 border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/50">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Problem Statement</h2>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <ProblemStatement
                                        title={problem.title}
                                        statement={problem.statement}
                                        difficulty={problem.difficulty}
                                        timeLimit={problem.timeLimit}
                                        memoryLimit={problem.memoryLimit}
                                        categories={problem.categories}
                                        testCases={problem.allTestCases}
                                    />
                                </div>
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200 w-1" />

                        {/* Right Panel: Code Editor */}
                        <ResizablePanel defaultSize={50} minSize={35} className="relative">
                            <div className="h-full flex flex-col">
                                
                                <div className="flex-1 overflow-hidden">
                                    <CodeEditor
                                        code={code}
                                        onCodeChange={setCode}
                                        language={language}
                                        onLanguageChange={setLanguage}
                                        onSubmit={handleSubmit}
                                        isSubmitting={isSubmitting || isExecuting}
                                        isAuthenticated={isAuthenticated}
                                        onLoginClick={() => window.location.href = '/login'}
                                        onRegisterClick={() => window.location.href = '/register'}
                                    />
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>

                {/* Submission Result */}
                {submissionResult && (
                    <div id="submission-result" className="mt-10 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Latest Submission</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Results from your most recent code execution</p>
                        </div>
                        <SubmissionResult
                            submission={submissionResult}
                            onViewCode={handleViewCode}
                        />
                    </div>
                )}

                {/* Submission History */}
                <div className="mt-10">
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Submission History</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Track your previous attempts and improvements</p>
                    </div>
                    <SubmissionHistory
                        submissions={submissions}
                        onViewCode={handleViewCode}
                        onViewSubmission={handleViewSubmission}
                    />
                </div>
            </div>

            {/* Code Viewer Modal */}
            {viewingCode && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200/60 dark:border-gray-700/60">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/50">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Submitted Code</h3>
                                <Badge variant="secondary" className="ml-2">
                                    {language.toUpperCase()}
                                </Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewingCode(null)}
                                className="h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
                            >
                                <span className="text-xl">×</span>
                            </Button>
                        </div>
                        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                            <pre className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl text-sm overflow-x-auto whitespace-pre-wrap border border-gray-200/60 dark:border-gray-700/60 font-mono leading-relaxed text-gray-900 dark:text-gray-100">
                                {viewingCode}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}