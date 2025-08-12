'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
    Clock,
    Users,
    FileText,
    Target,
    CheckCircle,
    XCircle,
    Timer,
    AlertCircle,
    Play,
    Eye,
    Code,
    Trophy,
    MessageSquare,
    BarChart3,
    Calendar,
    Award
} from 'lucide-react';

interface ContestProblem {
    id: number;
    order: number;
    points: number;
    problemId: number;
    title: string;
    timeLimit: number;
    memoryLimit: number;
    statement?: string;
}

interface ContestSubmission {
    id: number;
    problemId: number;
    language: string;
    verdict: string;
    score: number;
    submissionTime: string;
    executing?: boolean;
    cpuTime?: number;
    memoryUsage?: number;
    linkedSubmissionId?: number; // Add this field
}

interface ContestStanding {
    rank: number;
    userId: string;
    userName: string;
    totalScore: number;
    problemsSolved: number;
    penalty: number;
    lastSubmissionTime: string;
    problemResults: {
        problemId: number;
        score: number;
        attempts: number;
        isSolved: boolean;
        firstSolveTime?: string;
    }[];
}

interface ContestAnnouncement {
    id: number;
    title: string;
    content: string;
    isImportant: boolean;
    createdAt: string;
}

interface ContestData {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    problems: ContestProblem[];
    submissions: ContestSubmission[];
    standings: ContestStanding[];
    announcements: ContestAnnouncement[];
    totalPoints: number;
    solvedProblems: number;
    remainingTime: number;
    isRegistered: boolean;
}

export default function ContestPage() {
    const params = useParams();
    const contestId = params.id as string;

    const [contestData, setContestData] = useState<ContestData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProblem, setSelectedProblem] = useState<ContestProblem | null>(null);
    const [activeTab, setActiveTab] = useState('problems');
    const [sourceCode, setSourceCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('cpp');
    const [submitting, setSubmitting] = useState(false);
    const [lastSubmission, setLastSubmission] = useState<any>(null);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'executing' | 'completed' | 'error'>('idle');
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    useEffect(() => {
        if (contestId) {
            fetchContestData();
            // Update remaining time every second
            const interval = setInterval(updateRemainingTime, 1000);
            return () => clearInterval(interval);
        }
    }, [contestId]);

    const fetchContestData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/contests/${contestId}/full`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setContestData(result.data);
                if (result.data.problems.length > 0) {
                    setSelectedProblem(result.data.problems[0]);
                }
            } else {
                throw new Error(result.error || 'Failed to fetch contest data');
            }
        } catch (error) {
            console.error('Error fetching contest data:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch contest data');
        } finally {
            setLoading(false);
        }
    };

    const updateRemainingTime = () => {
        if (contestData) {
            const now = new Date().getTime();
            const endTime = new Date(contestData.endTime).getTime();
            const remaining = Math.max(0, endTime - now);

            setContestData(prev => prev ? { ...prev, remainingTime: remaining } : null);
        }
    };

    const submitSolution = async () => {
        if (!selectedProblem || !sourceCode.trim()) return;

        try {
            setSubmitting(true);
            setSubmissionStatus('submitting');
            setLastSubmission(null);

            const response = await fetch(`/api/contests/${contestId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    problemId: selectedProblem.problemId,
                    language: selectedLanguage,
                    sourceCode: sourceCode.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setLastSubmission(result.data);
                setSubmissionStatus('executing');

                // Show initial submission success
                const verdict = result.data.verdict;
                if (verdict === 'Pending') {
                    // Automatically execute the submission
                    if (result.data.linkedSubmissionId) {
                        await executeSubmission({
                            id: result.data.submissionId,
                            problemId: selectedProblem.problemId,
                            language: selectedLanguage,
                            verdict: 'Pending',
                            score: 0,
                            submissionTime: new Date().toISOString(),
                            linkedSubmissionId: result.data.linkedSubmissionId
                        });
                    }
                }

                setSourceCode('');
                // Refresh contest data to update submissions and standings
                await fetchContestData();
                // Switch to submissions tab to show the new submission
                setActiveTab('submissions');
                setSubmissionStatus('completed');

                // Clear submission status after a delay
                setTimeout(() => {
                    setSubmissionStatus('idle');
                    setLastSubmission(null);
                }, 5000);
            } else {
                throw new Error(result.error || 'Failed to submit solution');
            }
        } catch (error) {
            console.error('Error submitting solution:', error);
            setSubmissionError(error instanceof Error ? error.message : 'Failed to submit solution');
            setSubmissionStatus('error');
        } finally {
            setSubmitting(false);
        }
    };

    const executeSubmission = async (submission: ContestSubmission) => {
        try {
            // Mark submission as executing
            setContestData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    submissions: prev.submissions.map(sub =>
                        sub.id === submission.id ? { ...sub, executing: true } : sub
                    )
                };
            });

            // Use the linked submission ID if available, otherwise try to get it
            let regularSubmissionId = submission.linkedSubmissionId;

            if (!regularSubmissionId) {
                // Fallback: try to get it from the API
                const contestSubmissionResponse = await fetch(`/api/contests/${contestId}/submissions/${submission.id}/get-regular-id`);
                if (contestSubmissionResponse.ok) {
                    const contestSubmissionData = await contestSubmissionResponse.json();
                    regularSubmissionId = contestSubmissionData.data.submissionId;
                }
            }

            if (!regularSubmissionId) {
                throw new Error('No linked regular submission found. Please try submitting again.');
            }

            // Execute the submission using the solution execution API with the correct solution ID
            const response = await fetch(`/api/problems/${submission.problemId}/solutions/${regularSubmissionId}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Execution failed: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // Update the submission with the execution result
                const finalVerdict = result.results?.overallVerdict || 'Error';
                const finalScore = finalVerdict === 'AC' ? 100 : 0;

                // Update contest submission in the database
                await fetch(`/api/contests/${contestId}/submissions/${submission.id}/update-verdict`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        verdict: finalVerdict,
                        score: finalScore,
                        cpuTime: result.results?.maxTime || 0,
                        memoryUsage: result.results?.maxMemory || 0,
                    }),
                });

                // Refresh contest data to show updated submission
                await fetchContestData();

                // Success - verdict will be updated in the UI automatically
            } else {
                throw new Error(result.error || 'Execution failed');
            }
        } catch (error) {
            console.error('Error executing submission:', error);
        } finally {
            // Mark submission as not executing
            setContestData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    submissions: prev.submissions.map(sub =>
                        sub.id === submission.id ? { ...sub, executing: false } : sub
                    )
                };
            });
        }
    };

    const formatTime = (milliseconds: number) => {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getVerdictIcon = (verdict: string) => {
        switch (verdict.toLowerCase()) {
            case 'accepted':
            case 'ac':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'wrong answer':
            case 'wrong_answer':
            case 'wa':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'time limit exceeded':
            case 'time_limit_exceeded':
            case 'tle':
                return <Timer className="w-4 h-4 text-yellow-600" />;
            case 'memory limit exceeded':
            case 'memory_limit_exceeded':
            case 'mle':
                return <AlertCircle className="w-4 h-4 text-orange-600" />;
            case 'compilation error':
            case 'ce':
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            case 'runtime error':
            case 're':
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            case 'pending':
                return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
            case 'running...':
                return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict.toLowerCase()) {
            case 'accepted':
            case 'ac':
                return 'text-green-600';
            case 'wrong answer':
            case 'wrong_answer':
            case 'wa':
                return 'text-red-600';
            case 'time limit exceeded':
            case 'time_limit_exceeded':
            case 'tle':
                return 'text-yellow-600';
            case 'memory limit exceeded':
            case 'memory_limit_exceeded':
            case 'mle':
                return 'text-orange-600';
            case 'compilation error':
            case 'ce':
                return 'text-red-600';
            case 'runtime error':
            case 're':
                return 'text-red-600';
            case 'pending':
                return 'text-blue-600';
            case 'running...':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    const getVerdictDisplayName = (verdict: string) => {
        switch (verdict.toLowerCase()) {
            case 'ac':
                return 'Accepted';
            case 'wa':
                return 'Wrong Answer';
            case 'tle':
                return 'Time Limit Exceeded';
            case 'mle':
                return 'Memory Limit Exceeded';
            case 'ce':
                return 'Compilation Error';
            case 're':
                return 'Runtime Error';
            case 'pending':
                return 'Pending Execution';
            case 'running...':
                return 'Running...';
            default:
                return verdict;
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading contest...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !contestData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-semibold mb-2">Error Loading Contest</h2>
                        <p className="text-muted-foreground mb-4">{error || 'Contest not found'}</p>
                        <Button onClick={fetchContestData}>Try Again</Button>
                    </div>
                </div>
            </div>
        );
    }

    const progressPercentage = (contestData.solvedProblems / contestData.problems.length) * 100;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Contest Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold">{contestData.title}</h1>
                        <p className="text-muted-foreground mt-1">{contestData.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-red-600">
                            {formatTime(contestData.remainingTime)}
                        </div>
                        <div className="text-sm text-muted-foreground">Time Remaining</div>
                    </div>
                </div>

                {/* Contest Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{contestData.problems.length}</div>
                            <div className="text-sm text-muted-foreground">Problems</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{contestData.totalPoints}</div>
                            <div className="text-sm text-muted-foreground">Total Points</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{contestData.standings.length}</div>
                            <div className="text-sm text-muted-foreground">Participants</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{contestData.solvedProblems}</div>
                            <div className="text-sm text-muted-foreground">Solved</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span>Your Progress</span>
                        <span>{contestData.solvedProblems} / {contestData.problems.length} problems solved</span>
                    </div>
                    <Progress value={progressPercentage} className="w-full" />
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Problems List */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Problems</CardTitle>
                            <CardDescription>
                                {contestData.problems.length} problems • {contestData.totalPoints} total points
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {contestData.problems.map((problem) => {
                                const isSelected = selectedProblem?.id === problem.id;
                                const isSolved = contestData.submissions.some(
                                    sub => sub.problemId === problem.problemId && (sub.verdict === 'Accepted' || sub.verdict === 'AC')
                                );

                                return (
                                    <Button
                                        key={problem.id}
                                        variant={isSelected ? "default" : "ghost"}
                                        className={`w-full justify-start ${isSolved ? 'text-green-600' : ''}`}
                                        onClick={() => setSelectedProblem(problem)}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <span className="font-mono">#{problem.order}</span>
                                            <span className="truncate">{problem.title}</span>
                                            {isSolved && <CheckCircle className="w-4 h-4 ml-auto" />}
                                        </div>
                                    </Button>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Contest Content */}
                <div className="lg:col-span-3">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="problems">Problem</TabsTrigger>
                            <TabsTrigger value="submit">Submit</TabsTrigger>
                            <TabsTrigger value="submissions">Submissions</TabsTrigger>
                            <TabsTrigger value="standings">Standings</TabsTrigger>
                            <TabsTrigger value="announcements">Announcements</TabsTrigger>
                        </TabsList>

                        {/* Problem Tab */}
                        <TabsContent value="problems" className="space-y-4">
                            {selectedProblem ? (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-xl">
                                                    #{selectedProblem.order} - {selectedProblem.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    {selectedProblem.points} points
                                                </CardDescription>
                                            </div>
                                            <div className="flex gap-2 text-sm text-muted-foreground">
                                                <span>Time: {selectedProblem.timeLimit}ms</span>
                                                <span>Memory: {selectedProblem.memoryLimit}MB</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedProblem.statement ? (
                                            <div className="prose max-w-none">
                                                <div dangerouslySetInnerHTML={{ __html: selectedProblem.statement }} />
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">
                                                Problem statement will be displayed here.
                                                Click on "Submit" tab to submit your solution.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="flex items-center justify-center h-32">
                                        <div className="text-center text-muted-foreground">
                                            <FileText className="w-8 h-8 mx-auto mb-2" />
                                            <p>Select a problem to view details</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Submit Tab */}
                        <TabsContent value="submit" className="space-y-4">
                            {selectedProblem ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Submit Solution</CardTitle>
                                        <CardDescription>
                                            Submit your solution for: {selectedProblem.title}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium">Language</label>
                                                    <select
                                                        className="w-full mt-1 p-2 border rounded-md"
                                                        value={selectedLanguage}
                                                        onChange={(e) => {
                                                            setSelectedLanguage(e.target.value);
                                                            // Clear error when user changes language
                                                            if (submissionStatus === 'error') {
                                                                setSubmissionStatus('idle');
                                                                setSubmissionError(null);
                                                            }
                                                        }}
                                                    >
                                                        <option value="cpp">C++</option>
                                                        <option value="java">Java</option>
                                                        <option value="python">Python</option>
                                                        <option value="javascript">JavaScript</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Problem</label>
                                                    <div className="mt-1 p-2 bg-muted rounded-md">
                                                        #{selectedProblem.order} - {selectedProblem.title}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Source Code</label>
                                                <textarea
                                                    className="w-full mt-1 p-2 border rounded-md font-mono"
                                                    rows={15}
                                                    placeholder="// Write your solution here..."
                                                    value={sourceCode}
                                                    onChange={(e) => {
                                                        setSourceCode(e.target.value);
                                                        // Clear error when user starts typing
                                                        if (submissionStatus === 'error') {
                                                            setSubmissionStatus('idle');
                                                            setSubmissionError(null);
                                                        }
                                                    }}
                                                />
                                            </div>

                                            {/* Submission Status Indicator */}
                                            {submissionStatus !== 'idle' && (
                                                <div className={`p-3 rounded-md border ${submissionStatus === 'submitting' ? 'bg-blue-50 border-blue-200' :
                                                    submissionStatus === 'executing' ? 'bg-yellow-50 border-yellow-200' :
                                                        submissionStatus === 'completed' ? 'bg-green-50 border-green-200' : ''
                                                    }`}>
                                                    <div className="flex items-center gap-2">
                                                        {submissionStatus === 'submitting' && (
                                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                        )}
                                                        {submissionStatus === 'executing' && (
                                                            <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                                                        )}
                                                        {submissionStatus === 'completed' && (
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        )}
                                                        <span className={`text-sm font-medium ${submissionStatus === 'submitting' ? 'text-blue-700' :
                                                            submissionStatus === 'executing' ? 'text-yellow-700' :
                                                                submissionStatus === 'completed' ? 'text-green-700' : ''
                                                            }`}>
                                                            {submissionStatus === 'submitting' && 'Submitting solution...'}
                                                            {submissionStatus === 'executing' && 'Executing your code...'}
                                                            {submissionStatus === 'completed' && 'Submission completed!'}
                                                        </span>
                                                    </div>
                                                    {lastSubmission && (
                                                        <div className="mt-2 text-xs text-muted-foreground">
                                                            Submission ID: #{lastSubmission.submissionId} |
                                                            Status: {lastSubmission.verdict}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Success Message */}
                                            {submissionStatus === 'completed' && lastSubmission && (
                                                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                                    <div className="flex items-center gap-2 text-green-700">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span className="text-sm font-medium">
                                                            Solution submitted successfully! Check the Submissions tab for results.
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Error Message */}
                                            {submissionStatus === 'error' && submissionError && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                                    <div className="flex items-center gap-2 text-red-700">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span className="text-sm font-medium">
                                                            {submissionError}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            <Button
                                                className="w-full"
                                                onClick={submitSolution}
                                                disabled={submitting || !sourceCode.trim()}
                                            >
                                                {submitting ? (
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                                ) : (
                                                    <Code className="w-4 h-4 mr-2" />
                                                )}
                                                {submitting ? 'Submitting...' : 'Submit Solution'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="flex items-center justify-center h-32">
                                        <div className="text-center text-muted-foreground">
                                            <Code className="w-8 h-8 mx-auto mb-2" />
                                            <p>Select a problem to submit solution</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Submissions Tab */}
                        <TabsContent value="submissions" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Submissions</CardTitle>
                                    <CardDescription>
                                        All your contest submissions with detailed results
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {contestData.submissions.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Code className="w-8 h-8 mx-auto mb-2" />
                                            <p>No submissions yet</p>
                                            <p className="text-sm">Submit a solution to see it here</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {contestData.submissions.map((submission) => {
                                                const problem = contestData.problems.find(p => p.problemId === submission.problemId);
                                                return (
                                                    <div key={submission.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                {getVerdictIcon(submission.verdict)}
                                                                <span className={`font-semibold text-lg ${getVerdictColor(submission.verdict)}`}>
                                                                    {getVerdictDisplayName(submission.verdict)}
                                                                </span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {submission.language.toUpperCase()}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-2xl font-bold text-blue-600">
                                                                    {submission.score}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">points</div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                            <div>
                                                                <div className="text-muted-foreground">Problem</div>
                                                                <div className="font-medium">
                                                                    {problem ? `#${problem.order} ${problem.title}` : `ID: ${submission.problemId}`}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-muted-foreground">Submitted</div>
                                                                <div className="font-medium">
                                                                    {new Date(submission.submissionTime).toLocaleString()}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-muted-foreground">Status</div>
                                                                <div className="font-medium">
                                                                    {submission.verdict === 'Accepted' || submission.verdict === 'AC' ? '✅ Solved' :
                                                                        submission.verdict === 'Pending' ? '⏳ Pending Execution' : '❌ Not Solved'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-muted-foreground">Submission ID</div>
                                                                <div className="font-mono text-xs">
                                                                    #{submission.id}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Execution Details for Completed Submissions */}
                                                        {submission.verdict !== 'Pending' && (submission.cpuTime || submission.memoryUsage) && (
                                                            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                                                {submission.cpuTime && (
                                                                    <div>
                                                                        <div className="text-muted-foreground">Execution Time</div>
                                                                        <div className="font-medium">{submission.cpuTime}ms</div>
                                                                    </div>
                                                                )}
                                                                {submission.memoryUsage && (
                                                                    <div>
                                                                        <div className="text-muted-foreground">Memory Usage</div>
                                                                        <div className="font-medium">{submission.memoryUsage}KB</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Execution Status for Pending Submissions */}
                                                        {submission.verdict === 'Pending' && (
                                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                                <div className="flex items-center gap-2 text-blue-700">
                                                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                                    <span className="text-sm font-medium">
                                                                        Executing your solution automatically...
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {submission.verdict !== 'Accepted' && submission.verdict !== 'AC' && submission.verdict !== 'Pending' && (
                                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                                                                <div className="flex items-center gap-2 text-red-700">
                                                                    <AlertCircle className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">
                                                                        Keep trying! This problem hasn't been solved yet.
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Standings Tab */}
                        <TabsContent value="standings" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contest Standings</CardTitle>
                                    <CardDescription>
                                        Current rankings and scores
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2">Rank</th>
                                                    <th className="text-left p-2">User</th>
                                                    <th className="text-center p-2">Score</th>
                                                    <th className="text-center p-2">Solved</th>
                                                    <th className="text-center p-2">Penalty</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contestData.standings.map((standing) => (
                                                    <tr key={standing.userId} className="border-b hover:bg-muted/50">
                                                        <td className="p-2">
                                                            <div className="flex items-center gap-2">
                                                                {standing.rank <= 3 && (
                                                                    <Trophy className={`w-4 h-4 ${standing.rank === 1 ? 'text-yellow-500' :
                                                                        standing.rank === 2 ? 'text-gray-400' :
                                                                            'text-orange-500'
                                                                        }`} />
                                                                )}
                                                                <span className="font-medium">{standing.rank}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-2 font-medium">{standing.userName}</td>
                                                        <td className="p-2 text-center font-bold">{standing.totalScore}</td>
                                                        <td className="p-2 text-center">{standing.problemsSolved}</td>
                                                        <td className="p-2 text-center text-muted-foreground">{standing.penalty}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Announcements Tab */}
                        <TabsContent value="announcements" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contest Announcements</CardTitle>
                                    <CardDescription>
                                        Important updates and clarifications
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {contestData.announcements.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                                            <p>No announcements yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {contestData.announcements.map((announcement) => (
                                                <Card key={announcement.id} className={announcement.isImportant ? 'border-orange-200 bg-orange-50' : ''}>
                                                    <CardHeader className="pb-2">
                                                        <div className="flex items-center gap-2">
                                                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                                                            {announcement.isImportant && (
                                                                <Badge variant="destructive">Important</Badge>
                                                            )}
                                                        </div>
                                                        <CardDescription>
                                                            {new Date(announcement.createdAt).toLocaleString()}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="whitespace-pre-wrap">{announcement.content}</p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
