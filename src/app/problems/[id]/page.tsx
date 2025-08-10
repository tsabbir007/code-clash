"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from "@/components/navbar/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Loader2, Play, CheckCircle, XCircle, Clock, AlertTriangle, Loader, ChevronDownIcon, FileX } from "lucide-react"
import { cn } from "@/lib/utils"

// Utility function for case-insensitive difficulty comparison
const normalizeDifficulty = (difficulty: string): string => {
    if (!difficulty) return '';
    return difficulty.toLowerCase();
};

const isDifficultyMatch = (problemDifficulty: string, filterDifficulty: string): boolean => {
    return normalizeDifficulty(problemDifficulty) === normalizeDifficulty(filterDifficulty);
};

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
    const problemId = params.id as string

    const [problem, setProblem] = useState<Problem | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [code, setCode] = useState("")
    const [language, setLanguage] = useState("cpp")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isExecuting, setIsExecuting] = useState(false)
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
    const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const languages = [
        { value: "python", label: "Python 3" },
        { value: "cpp", label: "C++" },
        { value: "java", label: "Java" },
        { value: "javascript", label: "JavaScript" }
    ]

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
                    timestamp: new Date(sub.createdAt), // Fixed: use createdAt instead of submittedAt
                    language: sub.language,
                    code: sub.sourceCode, // Fixed: use sourceCode instead of code
                    verdict: sub.verdict || 'Pending', // Default to 'Pending' if no verdict
                    testCasesPassed: sub.testCasesPassed || 0,
                    totalTestCases: sub.totalTestCases || (problem?.allTestCases?.length || 0),
                    score: sub.score || 0,
                    totalScore: (problem?.allTestCases?.length || 0) * 10,
                    cpuTime: sub.cpuTime || 0, // Fixed: use cpuTime instead of executionTime
                    memoryUsage: sub.memoryUsage || 0,
                    executionTime: sub.cpuTime || 0, // Fixed: use cpuTime
                    memoryUsed: sub.memoryUsage || 0,
                    testCaseResults: [] // Will be populated if available
                }));

                // Clean up any submissions that might be stuck in "Running..." state
                const cleanedSubmissions = transformedSubmissions.map(sub => {
                    if (sub.verdict === 'Running...' || sub.verdict === 'Pending') {
                        // If submission is older than 5 minutes, mark it as failed
                        const submissionAge = Date.now() - sub.timestamp.getTime();
                        if (submissionAge > 5 * 60 * 1000) { // 5 minutes
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
                    totalScore: testCaseResults.reduce((sum, tc) => {
                        const problemTestCase = problem?.allTestCases?.find(ptc => ptc.id === tc.id);
                        return sum + (problemTestCase?.points || 1);
                    }, 0),
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

                    // Debug: Log the URL being constructed
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
                            input: '', // We don't need to show input in results
                            expectedOutput: '', // We don't need to show expected output in results
                            actualOutput: tc.verdict === 'AC' ? 'Correct' : 'Incorrect',
                            executionTime: tc.cpuTime,
                            memoryUsage: tc.memoryUsage,
                            error: tc.error
                        }));

                        // Calculate score based on passed test cases
                        const passedCount = executionData.results.passedTests;
                        const totalCount = executionData.results.totalTests;
                        const score = totalCount > 0 ? Math.floor((passedCount / totalCount) * 100) : 0;

                        // Update submission result with real execution data
                        const finalSubmission = {
                            ...newSubmission,
                            verdict: executionData.results.overallVerdict === 'AC' ? 'Accepted' : 'Wrong Answer',
                            score: score,
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

    const getVerdictIcon = (verdict: string) => {
        switch (verdict) {
            case "Accepted":
            case "AC":
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case "Wrong Answer":
            case "WA":
                return <XCircle className="h-5 w-5 text-red-500" />
            case "Time Limit Exceeded":
            case "TLE":
                return <Clock className="h-5 w-5 text-yellow-500" />
            case "Memory Limit Exceeded":
            case "MLE":
                return <AlertTriangle className="h-5 w-5 text-orange-500" />
            case "Runtime Error":
            case "RE":
                return <AlertTriangle className="h-5 w-5 text-red-600" />
            case "Compilation Error":
            case "CE":
                return <FileX className="h-5 w-5 text-red-600" />
            case "System Error":
                return <AlertTriangle className="h-5 w-5 text-red-600" />
            case "Running...":
                return <Loader className="h-5 w-5 text-blue-500 animate-spin" />
            case "Pending":
                return <Clock className="h-5 w-5 text-gray-500" />
            default:
                return <AlertTriangle className="h-5 w-5 text-gray-500" />
        }
    }

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case "Accepted":
            case "AC":
                return "text-green-500"
            case "Wrong Answer":
            case "WA":
                return "text-red-500"
            case "Time Limit Exceeded":
            case "TLE":
                return "text-yellow-500"
            case "Memory Limit Exceeded":
            case "MLE":
                return "text-orange-500"
            case "Runtime Error":
            case "RE":
                return "text-red-600"
            case "Compilation Error":
            case "CE":
                return "text-red-600"
            case "System Error":
                return "text-red-600"
            case "Running...":
                return "text-blue-500"
            case "Pending":
                return "text-gray-500"
            default:
                return "text-gray-500"
        }
    }

    const getTestStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
            case 'running':
                return <Loader className="w-4 h-4 text-blue-500 animate-spin" />
            case 'passed':
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />
            default:
                return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
        }
    }

    const getTestStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-gray-500'
            case 'running':
                return 'text-blue-500'
            case 'passed':
                return 'text-green-500'
            case 'failed':
                return 'text-red-500'
            default:
                return 'text-gray-500'
        }
    }

    const formatTimestamp = (timestamp: Date) => {
        // Safety check for invalid dates
        if (!timestamp || isNaN(timestamp.getTime())) {
            return 'Invalid date';
        }

        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(timestamp);
    };

    const getLanguageDisplayName = (lang: string) => {
        const langObj = languages.find(l => l.value === lang);
        return langObj ? langObj.label : lang;
    };

    // Helper function to get code templates for different languages
    const getCodeTemplate = (lang: string): string => {
        switch (lang) {
            case 'python':
                return `# Python solution
def solve():
    # Your code here
    pass

if __name__ == "__main__":
    solve()`;
            case 'cpp':
                return `#include <iostream>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`;
            case 'java':
                return `public class Solution {
    public static void main(String[] args) {
        // Your code here
        
    }
}`;
            case 'javascript':
                return `// JavaScript solution
function solve() {
    // Your code here
}

solve();`;
            default:
                return `// ${lang} solution
// Your code here`;
        }
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
                    if (submissionAge > 5 * 60 * 1000) { // 5 minutes
                        return {
                            ...sub,
                            verdict: 'System Error',
                            error: 'Submission timed out'
                        };
                    }
                }
                return sub;
            }));
        }, 60000); // Check every minute

        return () => clearInterval(cleanupInterval);
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col container">
                <Navbar />
                <div className="flex justify-center items-center py-20">
                    <div className="flex items-center gap-2">
                        <Loader className="w-6 h-6 animate-spin" />
                        <span>Loading problem...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="flex flex-col container">
                <Navbar />
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold text-red-500">Problem not found</h1>
                    <p className="text-gray-500 mt-2">The problem you&apos;re looking for doesn&apos;t exist.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <Navbar />
            <div>
                <div className="mx-auto">
                    {/* Problem Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-3xl font-bold">{problem.title}</h1>
                            <div className="flex items-center gap-2">
                                {problem.categories && problem.categories.map((cat) => (
                                    <Badge key={cat.id} variant="secondary" style={{ backgroundColor: cat.color }}>
                                        {cat.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Difficulty: <Badge variant={isDifficultyMatch(problem.difficulty, 'Easy') ? 'default' : isDifficultyMatch(problem.difficulty, 'Medium') ? 'secondary' : 'destructive'}>{problem.difficulty}</Badge></span>
                            <span>Time Limit: {problem.timeLimit}ms</span>
                            <span>Memory Limit: {problem.memoryLimit}MB</span>
                        </div>
                    </div>

                    {/* Two Column Layout: Problem Statement on Left, Code Editor on Right */}
                    <div className="h-[600px] border rounded-lg mb-8">
                        <ResizablePanelGroup direction="horizontal">
                            {/* Left Panel: Problem Statement */}
                            <ResizablePanel defaultSize={50} minSize={40}>
                                <div className="h-full p-4 border-r overflow-y-auto">
                                    <h2 className="text-xl font-semibold mb-4">Problem Statement</h2>
                                    <div
                                        className="prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: problem.statement }}
                                    />

                                    {/* All Test Cases */}
                                    {problem.allTestCases && problem.allTestCases.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold mb-3">Test Cases</h3>
                                            <div className="space-y-3">
                                                {problem.allTestCases.map((testCase, index) => (
                                                    <div key={testCase.id} className="bg-card p-3 rounded-lg border">
                                                        <h4 className="font-medium mb-2">Test Case {index + 1}</h4>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            <div>
                                                                <h5 className="font-medium text-sm text-gray-600 mb-1">Input:</h5>
                                                                <pre className="bg-muted p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap break-words">{testCase.input}</pre>
                                                            </div>
                                                            <div>
                                                                <h5 className="font-medium text-sm text-gray-600 mb-1">Expected Output:</h5>
                                                                <pre className="bg-muted p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap break-words">{testCase.output}</pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ResizablePanel>

                            <ResizableHandle withHandle />

                            {/* Right Panel: Code Editor and Submission */}
                            <ResizablePanel defaultSize={50} minSize={40}>
                                <div className="h-full p-4 overflow-y-auto">
                                    <h2 className="text-xl font-semibold mb-4">Submit Your Solution</h2>

                                    {/* Language Selection */}
                                    <div className="mb-4">
                                        <label htmlFor="language" className="block text-sm font-medium mb-2">
                                            Programming Language
                                        </label>
                                        <Select value={language} onValueChange={setLanguage}>
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cpp">C++</SelectItem>
                                                <SelectItem value="java">Java</SelectItem>
                                                <SelectItem value="python">Python</SelectItem>
                                                <SelectItem value="javascript">JavaScript</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Code Editor */}
                                    <div className="mb-4">
                                        <label htmlFor="code" className="block text-sm font-medium mb-2">
                                            Your Code
                                        </label>
                                        <Textarea
                                            id="code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder={`Enter your ${getLanguageDisplayName(language)} code here...`}
                                            className="font-mono text-sm min-h-[300px] max-h-[400px] resize-y overflow-y-auto"
                                        />
                                    </div>

                                    {/* Login Prompt */}
                                    {!isAuthenticated && (
                                        <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                                            <div className="flex items-center gap-2 text-yellow-200">
                                                <AlertTriangle className="h-5 w-5" />
                                                <span className="font-medium">Login Required</span>
                                            </div>
                                            <p className="text-sm text-yellow-300 mt-1">
                                                You need to be logged in to submit your solution. Please log in or create an account to continue.
                                            </p>
                                            <div className="mt-3">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href="/login">Log In</Link>
                                                </Button>
                                                <Button asChild variant="outline" size="sm" className="ml-2">
                                                    <Link href="/register">Register</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !code.trim()}
                                        className="w-full sm:w-auto"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" />
                                                Submit Solution
                                            </>
                                        )}
                                    </Button>

                                    {/* Submission Result */}
                                    {submissionResult && (
                                        <div className="mt-6 p-4 bg-card border rounded-lg max-h-[300px] overflow-y-auto">
                                            <h3 className="text-lg font-semibold mb-3">Submission Result</h3>
                                            <div className="flex items-center gap-3 mb-3">
                                                {getVerdictIcon(submissionResult.verdict)}
                                                <span className={`font-medium ${getVerdictColor(submissionResult.verdict)}`}>
                                                    {submissionResult.verdict}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {submissionResult.testCasesPassed}/{submissionResult.totalTestCases} test cases passed
                                                </span>
                                            </div>

                                            {/* Test Case Results */}
                                            {submissionResult.testCaseResults && submissionResult.testCaseResults.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="font-medium">Test Case Results:</h4>
                                                    {submissionResult.testCaseResults.map((testCase, index) => (
                                                        <div key={index} className="bg-muted p-3 rounded-lg">
                                                            <div className="flex items-center gap-2 text-sm mb-2">
                                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${getTestStatusColor(testCase.status)}`}>
                                                                    {getTestStatusIcon(testCase.status)}
                                                                </div>
                                                                <span className="font-medium">Test {index + 1}:</span>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${testCase.status === 'passed' ? 'bg-green-100 text-green-800' :
                                                                    testCase.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {testCase.status === 'passed' ? 'Passed' :
                                                                        testCase.status === 'failed' ? 'Failed' :
                                                                            testCase.status === 'running' ? 'Running...' : 'Pending'}
                                                                </span>
                                                            </div>

                                                            {/* Test Case Details */}
                                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                                <div>
                                                                    <span className="text-muted-foreground">CPU Time:</span>
                                                                    <span className="ml-2 font-mono">
                                                                        {testCase.executionTime !== undefined ? `${testCase.executionTime}ms` : 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">Memory:</span>
                                                                    <span className="ml-2 font-mono">
                                                                        {testCase.memoryUsage !== undefined ? `${testCase.memoryUsage}MB` : 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Error Message if Failed */}
                                                            {testCase.status === 'failed' && testCase.error && (
                                                                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                                                    <span className="font-medium">Error:</span> {testCase.error}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Execution Details */}
                                            <div className="text-sm text-muted-foreground mt-3">
                                                <div>Execution Time: {submissionResult.executionTime}ms</div>
                                                <div>Memory Used: {submissionResult.memoryUsed}MB</div>
                                                <div>Submitted at: {formatTimestamp(submissionResult.timestamp)}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>

                    {/* Submission List at Bottom */}
                    <div className="border rounded-lg p-4 max-h-[500px] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4">Submission History ({submissions?.length || 0})</h2>

                        {!submissions || submissions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {submissions === null ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Loading submissions...
                                    </div>
                                ) : (
                                    'No submissions yet. Submit your first solution above!'
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {submissions && submissions.map((submission, index) => (
                                    <div key={index} className="bg-card p-4 rounded-lg border">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                {getVerdictIcon(submission.verdict)}
                                                <span className={`font-medium ${getVerdictColor(submission.verdict)}`}>
                                                    {submission.verdict}
                                                </span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {formatTimestamp(submission.timestamp)}
                                            </span>
                                        </div>

                                        <div className="text-sm text-muted-foreground mb-3">
                                            <span>Language: {getLanguageDisplayName(submission.language)}</span>
                                            <span className="mx-2">•</span>
                                            <span>Time: {submission.executionTime}ms</span>
                                            <span className="mx-2">•</span>
                                            <span>Memory: {submission.memoryUsed}MB</span>
                                        </div>

                                        {/* Test Case Results Summary */}
                                        {submission.testCaseResults && submission.testCaseResults.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="text-sm text-muted-foreground">
                                                    {submission.testCaseResults.filter(tc => tc.status === 'passed').length} passed,
                                                    {submission.testCaseResults.filter(tc => tc.status === 'failed').length} failed
                                                </div>

                                                {/* Individual Test Case Details */}
                                                <div className="space-y-1">
                                                    {submission.testCaseResults.map((testCase, index) => (
                                                        <div key={index} className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-3 h-3 rounded-full ${getTestStatusColor(testCase.status)}`}></div>
                                                                <span>Test {index + 1}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                                <span>CPU: {testCase.executionTime !== undefined ? `${testCase.executionTime}ms` : 'N/A'}</span>
                                                                <span>Mem: {testCase.memoryUsage !== undefined ? `${testCase.memoryUsage}MB` : 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}