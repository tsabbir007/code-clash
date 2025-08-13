'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from "@/components/navbar/navbar";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useContestTimer } from '@/hooks/use-contest-timer';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
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
    Award,
    Loader,
    AlertTriangle
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
    sourceCode?: string; // Add source code field
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

// Monaco editor language mapping
const MONACO_LANGUAGE_MAP: Record<string, string> = {
    cpp: 'cpp',
    java: 'java',
    python: 'python',
    javascript: 'javascript',
};

export default function ContestPage() {
    const params = useParams();
    const contestId = params.contestId as string;
    const { theme } = useTheme();

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
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        if (contestId) {
            fetchContestData();
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

    // Use the contest timer hook only when we have contest data
    const timer = useContestTimer({
        startTime: contestData?.startTime || '',
        endTime: contestData?.endTime || '',
        initialRemainingTime: contestData?.remainingTime || 0,
    });

    const registerForContest = async () => {
        try {
            setRegistering(true);

            const response = await fetch(`/api/contests/${contestId}/register`, {
                method: 'POST',
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Refresh contest data to update registration status
                await fetchContestData();
            } else {
                // Handle API errors with specific messages
                const errorMessage = result.error || `Registration failed (${response.status})`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error registering for contest:', error);
            setError(error instanceof Error ? error.message : 'Failed to register for contest');
        } finally {
            setRegistering(false);
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
                            linkedSubmissionId: result.data.linkedSubmissionId,
                            sourceCode: sourceCode.trim()
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

            // Get the regular submission ID from the contest submission
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

            // First, we need to create a solution record for the regular submission
            // The solution execution API expects a solution ID, not a submission ID
            const createSolutionResponse = await fetch(`/api/problems/${submission.problemId}/solutions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    label: `Contest Solution ${new Date().toLocaleTimeString()}`,
                    note: 'Contest submission solution',
                    language: submission.language,
                    sourceCode: submission.sourceCode || ''
                })
            });

            if (!createSolutionResponse.ok) {
                throw new Error('Failed to create solution for execution');
            }

            const solutionData = await createSolutionResponse.json();
            const solutionId = solutionData.solution.id;

            // Now execute the solution using the correct solution ID
            const response = await fetch(`/api/problems/${submission.problemId}/solutions/${solutionId}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
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
            <div className="flex flex-col min-h-screen">
                <div className="flex-1 flex justify-center items-center">
                    <div className="flex flex-col justify-center items-center text-center space-y-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading Contest</h2>
                            <p className="text-gray-500 dark:text-gray-400">Preparing your contest environment...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !contestData) {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center space-y-6 max-w-md mx-auto px-6">
                        <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contest Not Found</h1>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                The contest you're looking for doesn't exist or may have been removed.
                            </p>
                        </div>
                        <Link
                            href="/contests"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
                        >
                            Browse Contests
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const progressPercentage = (contestData.solvedProblems / contestData.problems.length) * 100;

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-1 mx-auto w-full px-4 py-8">
                {/* Contest Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold">{contestData.title}</h1>
                            <p className="text-muted-foreground mt-1">{contestData.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex flex-col items-end">
                                {loading || !contestData ? (
                                    // Loading state for timer
                                    <div className="text-center">
                                        <div className="text-3xl font-mono font-bold text-gray-400 mb-1">
                                            --:--:--
                                        </div>
                                        <div className="text-sm text-muted-foreground mb-2">Loading...</div>
                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </div>
                                ) : (
                                    // Timer display when data is loaded
                                    <>
                                        <div className={`text-3xl font-mono font-bold ${timer.getTimerDisplay().color} mb-1 transition-colors duration-300`}>
                                            {timer.getTimerDisplay().time}
                                        </div>
                                        <div className="text-sm text-muted-foreground mb-2">{timer.getTimerDisplay().text}</div>
                                        {timer.isRunning && (
                                            <div className="flex items-center gap-2 text-xs text-green-600">
                                                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                                Live
                                            </div>
                                        )}
                                        {!timer.isContestStarted && (
                                            <div className="flex items-center gap-2 text-xs text-blue-600">
                                                <Clock className="w-3 h-3" />
                                                Starting Soon
                                            </div>
                                        )}
                                        {timer.isContestEnded && (
                                            <div className="flex items-center gap-2 text-xs text-red-600">
                                                <XCircle className="w-3 h-3" />
                                                Ended
                                            </div>
                                        )}
                                        {/* Additional timer info */}
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {timer.isRunning && (
                                                <span>Ends: {new Date(contestData.endTime).toLocaleTimeString()}</span>
                                            )}
                                            {!timer.isContestStarted && (
                                                <span>Starts: {new Date(contestData.startTime).toLocaleTimeString()}</span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contest Info */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-indigo-600">
                                    {contestData.startTime && contestData.endTime ?
                                        timer.formatTime(new Date(contestData.endTime).getTime() - new Date(contestData.startTime).getTime()) :
                                        '--:--:--'
                                    }
                                </div>
                                <div className="text-sm text-muted-foreground">Duration</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contest Status and Progress */}
                    <div className="space-y-4 mb-6">
                        {/* Contest Status */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {!loading && contestData && timer.isRunning && (
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                        <Play className="w-3 h-3 mr-1" />
                                        Contest Running
                                    </Badge>
                                )}
                                {!loading && contestData && !timer.isContestStarted && (
                                    <Badge variant="outline" className="border-blue-600 text-blue-600">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Starting Soon
                                    </Badge>
                                )}
                                {!loading && contestData && timer.isContestEnded && (
                                    <Badge variant="destructive">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Contest Ended
                                    </Badge>
                                )}
                                {loading && (
                                    <Badge variant="outline" className="border-gray-400 text-gray-400">
                                        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-1" />
                                        Loading...
                                    </Badge>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {!loading && contestData && timer.isContestStarted && !timer.isContestEnded && (
                                    <span>Started: {new Date(contestData.startTime).toLocaleString()}</span>
                                )}
                                {!loading && contestData && !timer.isContestStarted && (
                                    <span>Starts: {new Date(contestData.startTime).toLocaleString()}</span>
                                )}
                                {!loading && contestData && timer.isContestEnded && (
                                    <span>Ended: {new Date(contestData.endTime).toLocaleString()}</span>
                                )}
                            </div>
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

                    {/* Registration Status */}
                    {!loading && contestData && !contestData.isRegistered ? (
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-orange-600" />
                                        <div>
                                            <h3 className="font-semibold text-orange-800">Not Registered</h3>
                                            <p className="text-sm text-orange-700">
                                                {timer.isContestEnded
                                                    ? 'This contest has ended. Registration is no longer available.'
                                                    : timer.isRunning
                                                        ? 'You must register for this contest to submit solutions and participate.'
                                                        : 'You must register for this contest to participate when it starts.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={registerForContest}
                                        disabled={registering || timer.isContestEnded}
                                        className="bg-orange-700 hover:bg-orange-800"
                                    >
                                        {registering ? (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                        ) : (
                                            <Users className="w-4 h-4 mr-2" />
                                        )}
                                        {registering ? 'Registering...' : timer.isContestEnded ? 'Registration Closed' : 'Register for Contest'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : !loading && contestData && contestData.isRegistered ? (
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                        <h3 className="font-semibold text-green-800">Registered</h3>
                                        <p className="text-sm text-green-700">
                                            {timer.isContestEnded
                                                ? 'You were registered for this contest. It has now ended.'
                                                : timer.isRunning
                                                    ? 'You are registered for this contest and can submit solutions.'
                                                    : 'You are registered for this contest and can participate when it starts.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-gray-200 bg-gray-50">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Loading...</h3>
                                        <p className="text-sm text-gray-700">Checking registration status...</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
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
                                    const isAccessible = !loading && contestData && timer.isRunning && contestData.isRegistered;

                                    return (
                                        <Button
                                            key={problem.id}
                                            variant={isSelected ? "default" : "ghost"}
                                            className={`w-full justify-start ${isSolved ? 'text-green-600' : ''} ${!isAccessible ? 'opacity-50' : ''}`}
                                            onClick={() => setSelectedProblem(problem)}
                                            disabled={!isAccessible}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <span className="font-mono">#{problem.order}</span>
                                                <span className="truncate">{problem.title}</span>
                                                <div className="ml-auto flex items-center gap-1">
                                                    {isSolved && <CheckCircle className="w-4 h-4" />}
                                                    {!isAccessible && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {loading ? 'Loading...' : timer.isContestEnded ? 'Ended' : 'Not Started'}
                                                        </span>
                                                    )}
                                                </div>
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
                                {!contestData.isRegistered ? (
                                    <Card>
                                        <CardContent className="p-6 text-center">
                                            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-600" />
                                            <h3 className="text-xl font-semibold mb-2">Registration Required</h3>
                                            <p className="mb-4">
                                                {timer.isContestEnded
                                                    ? 'This contest has ended. Registration is no longer available.'
                                                    : 'You must register for this contest before you can submit solutions.'
                                                }
                                            </p>
                                            {!timer.isContestEnded && (
                                                <Button
                                                    onClick={registerForContest}
                                                    disabled={registering}
                                                    className="bg-orange-600 hover:bg-orange-700"
                                                >
                                                    {registering ? (
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                                    ) : (
                                                        <Users className="w-4 h-4 mr-2" />
                                                    )}
                                                    {registering ? 'Registering...' : 'Register for Contest'}
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ) : !timer.isRunning ? (
                                    <Card className="border-blue-200 bg-blue-50">
                                        <CardContent className="p-6 text-center">
                                            <Clock className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                                            <h3 className="text-xl font-semibold text-blue-800 mb-2">
                                                {timer.isContestEnded ? 'Contest Ended' : 'Contest Not Started'}
                                            </h3>
                                            <p className="text-blue-700 mb-4">
                                                {timer.isContestEnded
                                                    ? 'This contest has ended. You can no longer submit solutions.'
                                                    : 'The contest has not started yet. You will be able to submit solutions when it begins.'
                                                }
                                            </p>
                                            {!timer.isContestEnded && (
                                                <div className="text-sm text-blue-600">
                                                    Contest starts in: {timer.formatTime(timer.timeUntilStart)}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ) : selectedProblem ? (
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
                                                        <label className="text-sm font-medium">
                                                            Language
                                                            {selectedLanguage && (
                                                                <span className="ml-2 text-xs text-muted-foreground">
                                                                    ({MONACO_LANGUAGE_MAP[selectedLanguage]})
                                                                </span>
                                                            )}
                                                        </label>
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
                                                    <div className="mt-1 border rounded-md overflow-hidden bg-background">
                                                        <Editor
                                                            height="400px"
                                                            language={MONACO_LANGUAGE_MAP[selectedLanguage] || 'plaintext'}
                                                            value={sourceCode || ''}
                                                            onChange={(value) => {
                                                                setSourceCode(value || '');
                                                                // Clear error when user starts typing
                                                                if (submissionStatus === 'error') {
                                                                    setSubmissionStatus('idle');
                                                                    setSubmissionError(null);
                                                                }
                                                            }}
                                                            loading={<div className="flex items-center justify-center h-[400px] text-muted-foreground">Loading editor...</div>}
                                                            options={{
                                                                minimap: { enabled: false },
                                                                scrollBeyondLastLine: false,
                                                                fontSize: 14,
                                                                lineNumbers: 'on',
                                                                roundedSelection: false,
                                                                scrollbar: {
                                                                    vertical: 'visible',
                                                                    horizontal: 'visible',
                                                                },
                                                                automaticLayout: true,
                                                                theme: theme === 'dark' ? 'vs-dark' : 'vs-light',
                                                                wordWrap: 'on',
                                                                folding: true,
                                                                showFoldingControls: 'always',
                                                                suggestOnTriggerCharacters: true,
                                                                quickSuggestions: true,
                                                                parameterHints: { enabled: true },
                                                                hover: { enabled: true },
                                                                contextmenu: true,
                                                                copyWithSyntaxHighlighting: true,
                                                            }}
                                                        />
                                                    </div>
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
                                                    disabled={submitting || !sourceCode.trim() || !timer.isRunning}
                                                >
                                                    {submitting ? (
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                                    ) : (
                                                        <Code className="w-4 h-4 mr-2" />
                                                    )}
                                                    {submitting ? 'Submitting...' : !timer.isRunning ? 'Contest Not Running' : 'Submit Solution'}
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
                                                            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">

                                                                <div>
                                                                    <div className="text-muted-foreground">Execution Time</div>
                                                                    <div className="font-medium">{submission.cpuTime}ms</div>
                                                                </div>


                                                                <div>
                                                                    <div className="text-muted-foreground">Memory Usage</div>
                                                                    <div className="font-medium">{submission.memoryUsage}KB</div>
                                                                </div>

                                                            </div>

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
        </div>
    );
}
