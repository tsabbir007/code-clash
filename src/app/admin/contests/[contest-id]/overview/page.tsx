'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    Trophy,
    Calendar,
    Clock,
    Users,
    FileText,
    Target,
    CheckCircle,
    XCircle,
    Timer,
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';

interface Contest {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    isPublic: boolean;
    createdAt: string;
    createdBy: string;
}

interface ContestProblem {
    id: number;
    order: number;
    points: number;
    problemId: number;
    title: string;
    timeLimit: number;
    memoryLimit: number;
}

interface RecentSubmission {
    id: number;
    problemId: number;
    userId: string;
    language: string;
    verdict: string;
    score: number;
    submissionTime: string;
    problemTitle: string;
    userName: string;
}

interface ContestStatistics {
    participants: number;
    problems: number;
    totalPoints: number;
    submissions: number;
    averageScore: number;
    solvedProblems: number;
    duration: {
        hours: number;
        minutes: number;
        totalMs: number;
    };
}

interface ContestOverviewData {
    contest: Contest;
    statistics: ContestStatistics;
    problems: ContestProblem[];
    recentSubmissions: RecentSubmission[];
}

export default function ContestOverview() {
    const params = useParams();
    const contestId = params['contest-id'] as string;

    const [overviewData, setOverviewData] = useState<ContestOverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (contestId) {
            fetchContestOverview();
        }
    }, [contestId]);

    const fetchContestOverview = async () => {
        try {
            setLoading(true);
            setError(null);

            // Call the working API route at [id]/overview
            const response = await fetch(`/api/admin/contests/${contestId}/overview`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setOverviewData(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch contest overview');
            }
        } catch (error) {
            console.error('Error fetching contest overview:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch contest overview');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading contest overview...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !overviewData) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-semibold mb-2">
                            {error ? 'Error Loading Contest' : 'Contest Not Found'}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            {error || 'The requested contest could not be found.'}
                        </p>
                        <Button onClick={fetchContestOverview}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const { contest, statistics, problems, recentSubmissions } = overviewData;

    const getContestStatus = () => {
        const now = new Date();
        const startTime = new Date(contest.startTime);
        const endTime = new Date(contest.endTime);

        if (now < startTime) {
            return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
        } else if (now >= startTime && now <= endTime) {
            return { status: 'active', color: 'bg-green-100 text-green-800' };
        } else {
            return { status: 'ended', color: 'bg-red-100 text-red-800' };
        }
    };

    const getVerdictIcon = (verdict: string) => {
        switch (verdict.toLowerCase()) {
            case 'accepted':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'wrong answer':
            case 'wrong_answer':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'time limit exceeded':
            case 'time_limit_exceeded':
                return <Timer className="w-4 h-4 text-yellow-600" />;
            case 'memory limit exceeded':
            case 'memory_limit_exceeded':
                return <AlertCircle className="w-4 h-4 text-orange-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict.toLowerCase()) {
            case 'accepted':
                return 'text-green-600';
            case 'wrong answer':
            case 'wrong_answer':
                return 'text-red-600';
            case 'time limit exceeded':
            case 'time_limit_exceeded':
                return 'text-yellow-600';
            case 'memory limit exceeded':
            case 'memory_limit_exceeded':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatDuration = (hours: number, minutes: number) => {
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMinutes > 0) return `${diffMinutes}m ago`;
        return 'Just now';
    };

    const contestStatus = getContestStatus();

    return (
        <div className="space-y-6">
            {/* Contest Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{contest.title}</h1>
                    <p className="text-muted-foreground mt-1">{contest.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={contest.isPublic ? "default" : "secondary"}>
                        {contest.isPublic ? (
                            <>
                                <Eye className="w-3 h-3 mr-1" />
                                Public
                            </>
                        ) : (
                            <>
                                <EyeOff className="w-3 h-3 mr-1" />
                                Private
                            </>
                        )}
                    </Badge>
                    <Badge className={contestStatus.color}>
                        {contestStatus.status.charAt(0).toUpperCase() + contestStatus.status.slice(1)}
                    </Badge>
                </div>
            </div>

            {/* Contest Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Start Time</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDateTime(contest.startTime)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">End Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDateTime(contest.endTime)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatDuration(statistics.duration.hours, statistics.duration.minutes)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Created</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDateTime(contest.createdAt)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Participants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.participants}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Problems</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.problems}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totalPoints}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.submissions}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Solved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.solvedProblems}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Average Score Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Average Score</CardTitle>
                    <CardDescription>
                        Overall performance across all submissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>Score</span>
                            <span>{statistics.averageScore}%</span>
                        </div>
                        <Progress value={statistics.averageScore} className="w-full" />
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for Problems and Recent Activity */}
            <Tabs defaultValue="problems" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="problems">Problems ({problems.length})</TabsTrigger>
                    <TabsTrigger value="activity">Recent Activity ({recentSubmissions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="problems" className="space-y-4">
                    {problems.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center h-32">
                                <div className="text-center text-muted-foreground">
                                    <FileText className="w-8 h-8 mx-auto mb-2" />
                                    <p>No problems added to this contest yet.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {problems.map((problem) => (
                                <Card key={problem.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">#{problem.order}</Badge>
                                                <CardTitle className="text-lg">{problem.title}</CardTitle>
                                            </div>
                                            <Badge variant="secondary">{problem.points} pts</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                            <div>Time Limit: {problem.timeLimit}ms</div>
                                            <div>Memory Limit: {problem.memoryLimit}MB</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                    {recentSubmissions.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center h-32">
                                <div className="text-center text-muted-foreground">
                                    <FileText className="w-8 h-8 mx-auto mb-2" />
                                    <p>No submissions yet.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {recentSubmissions.map((submission) => (
                                <Card key={submission.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    {getVerdictIcon(submission.verdict)}
                                                    <span className={`font-medium ${getVerdictColor(submission.verdict)}`}>
                                                        {submission.verdict}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {submission.problemTitle}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{submission.userName}</span>
                                                <span>{submission.language}</span>
                                                <span>{submission.score}%</span>
                                                <span>{formatTimeAgo(submission.submissionTime)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
