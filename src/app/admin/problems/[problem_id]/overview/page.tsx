'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    Copy,
    Edit2,
    Eye,
    FileText,
    Settings,
    Users,
    BarChart3,
    Clock,
    Database,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Activity
} from 'lucide-react';
import Link from 'next/link';

interface ProblemOverview {
    id: number;
    title: string;
    statement: string;
    description: string;
    difficulty: string;
    timeLimit: number;
    memoryLimit: number;
    checkerType: string;
    createdAt: string;
    userName: string;
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
}

interface RecentSubmission {
    id: number;
    userId: string;
    problemId: number;
    language: string;
    sourceCode: string;
    verdict: string;
    cpuTime: number;
    memoryUsage: number;
    score: number;
    testCasesPassed: number;
    totalTestCases: number;
    type: string;
    createdAt: string;
}

interface RecentActivity {
    id: number;
    type: string;
    description: string;
    timestamp: string;
    userId: string;
    username: string;
}

export default function OverviewPage() {
    const params = useParams();
    const problemId = params.problem_id as string;

    const [problem, setProblem] = useState<ProblemOverview | null>(null);
    const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProblemOverview();
        fetchRecentSubmissions();
        fetchRecentActivity();
    }, [problemId]);

    const fetchProblemOverview = async () => {
        try {
            setLoading(true);
            // Use the correct API endpoint for problem details
            const response = await fetch(`/api/problems/public/${problemId}`);
            const data = await response.json();

            if (data.success) {
                setProblem(data.problem);
            } else {
                toast.error(data.error || 'Failed to fetch problem overview');
            }
        } catch (error) {
            console.error('Error fetching problem overview:', error);
            toast.error('Failed to fetch problem overview');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentSubmissions = async () => {
        try {
            // Use the correct API endpoint for submissions
            const response = await fetch(`/api/submissions?problemId=${problemId}&limit=5`);
            const data = await response.json();
            if (data.success) {
                setRecentSubmissions(data.submissions);
            }
        } catch (error) {
            console.error('Error fetching recent submissions:', error);
        }
    };

    const fetchRecentActivity = async () => {
        try {
            // For now, we'll skip activity since there's no API endpoint for it
            // This can be implemented later if needed
            setRecentActivity([]);
        } catch (error) {
            console.error('Error fetching recent activity:', error);
        }
    };

    const formatTimeLimit = (timeMs: number) => {
        if (timeMs >= 1000) {
            return `${timeMs / 1000}s`;
        }
        return `${timeMs}ms`;
    };

    const formatMemoryLimit = (memoryKB: number) => {
        if (memoryKB >= 1024) {
            return `${(memoryKB / 1024).toFixed(1)}MB`;
        }
        return `${memoryKB}KB`;
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'accepted':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'wrong answer':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'time limit exceeded':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'memory limit exceeded':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'runtime error':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'compilation error':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'hard':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div>
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading problem overview...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!problem) {
        return (
            <div>
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <p className="text-muted-foreground">Problem not found</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div>
            {/* Problem Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{problem.title}</h1>
                        {problem.description && (
                            <p className="text-muted-foreground mt-2 text-lg">{problem.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3">
                            <Badge className={getDifficultyColor(problem.difficulty)}>
                                {problem.difficulty}
                            </Badge>
                            <Badge variant="outline">ID: {problem.id}</Badge>
                            <Badge variant="outline">Created by {problem.userName}</Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/admin/problems/${problemId}/preview-problem`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/problems/${problemId}/statement`}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Statement
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Problem Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Difficulty</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{problem.difficulty}</div>
                        <p className="text-xs text-muted-foreground">
                            Problem level
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Time Limit</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatTimeLimit(problem.timeLimit)}</div>
                        <p className="text-xs text-muted-foreground">
                            Maximum execution time
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Memory Limit</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatMemoryLimit(problem.memoryLimit)}</div>
                        <p className="text-xs text-muted-foreground">
                            Maximum memory usage
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Test Cases</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{problem.allTestCases.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Total test cases
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Problem Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Test Cases Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Test Cases
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{problem.allTestCases.length}</div>
                                    <div className="text-sm text-muted-foreground">Total</div>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {problem.allTestCases.filter(tc => tc.isSample).length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Sample</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Submissions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Recent Submissions
                                </CardTitle>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/problems/${problemId}/submissions`}>
                                        View All
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentSubmissions.length > 0 ? (
                                <div className="space-y-3">
                                    {recentSubmissions.map((submission) => (
                                        <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <span className="text-xs font-medium">
                                                        {submission.userId.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">User {submission.userId}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {submission.language} • {new Date(submission.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getStatusColor(submission.verdict)}>
                                                    {submission.verdict}
                                                </Badge>
                                                <span className="text-sm font-medium">{submission.score}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic text-center py-4">
                                    No recent submissions
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href={`/admin/problems/${problemId}/statement`}>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit Statement
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href={`/admin/problems/${problemId}/test-cases`}>
                                    <Database className="h-4 w-4 mr-2" />
                                    Manage Test Cases
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href={`/admin/problems/${problemId}/limits`}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Set Limits
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href={`/admin/problems/${problemId}/checkers`}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Configure Checkers
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href={`/admin/problems/${problemId}/moderators`}>
                                    <Users className="h-4 w-4 mr-2" />
                                    Manage Moderators
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Problem Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Problem Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Limits</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Time:</span>
                                        <span className="font-mono">{formatTimeLimit(problem.timeLimit)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Memory:</span>
                                        <span className="font-mono">{formatMemoryLimit(problem.memoryLimit)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Checker:</span>
                                        <Badge variant="outline" className="text-xs">{problem.checkerType}</Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-semibold text-sm mb-2">Timestamps</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created:</span>
                                        <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created by:</span>
                                        <span>{problem.userName}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentActivity.length > 0 ? (
                                <div className="space-y-3">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="text-sm">
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{activity.description}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        by {activity.username} • {new Date(activity.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic text-center py-4 text-sm">
                                    No recent activity
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
