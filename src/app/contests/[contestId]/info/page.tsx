'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Clock,
    Users,
    FileText,
    Target,
    Calendar,
    Trophy,
    Info,
    Ruler,
    Award,
    Play,
    UserPlus
} from 'lucide-react';

interface ContestProblem {
    id: number;
    order: number;
    points: number;
    problemId: number;
    title: string;
    timeLimit: number;
    memoryLimit: number;
}

interface ContestData {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    isPublic: boolean;
    problems: ContestProblem[];
    participants: number;
    totalPoints: number;
}

export default function ContestInfoPage() {
    const params = useParams();
    const contestId = params.contestId as string;

    const [contestData, setContestData] = useState<ContestData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        if (contestId) {
            fetchContestInfo();
        }
    }, [contestId]);

    const fetchContestInfo = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/contests/${contestId}/info`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setContestData(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch contest info');
            }
        } catch (error) {
            console.error('Error fetching contest info:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch contest info');
        } finally {
            setLoading(false);
        }
    };

    const registerForContest = async () => {
        try {
            setRegistering(true);

            const response = await fetch(`/api/contests/${contestId}/register`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                alert('Successfully registered for the contest!');
                await fetchContestInfo(); // Refresh to update participant count
            } else {
                throw new Error(result.error || 'Failed to register for contest');
            }
        } catch (error) {
            console.error('Error registering for contest:', error);
            alert(error instanceof Error ? error.message : 'Failed to register for contest');
        } finally {
            setRegistering(false);
        }
    };

    const getContestStatus = (startTime: string, endTime: string) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now < start) {
            return { status: 'upcoming', color: 'bg-blue-100 text-blue-800', label: 'Upcoming' };
        } else if (now >= start && now <= end) {
            return { status: 'active', color: 'bg-green-100 text-green-800', label: 'Active' };
        } else {
            return { status: 'ended', color: 'bg-red-100 text-red-800', label: 'Ended' };
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatDuration = (startTime: string, endTime: string) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end.getTime() - start.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading contest information...</p>
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
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-semibold mb-2">Error Loading Contest</h2>
                        <p className="text-muted-foreground mb-4">{error || 'Contest not found'}</p>
                        <Button onClick={fetchContestInfo}>Try Again</Button>
                    </div>
                </div>
            </div>
        );
    }

    const contestStatus = getContestStatus(contestData.startTime, contestData.endTime);
    const isActive = contestStatus.status === 'active';
    const isUpcoming = contestStatus.status === 'upcoming';

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Contest Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge className={contestStatus.color}>
                        {contestStatus.label}
                    </Badge>
                    <Badge variant={contestData.isPublic ? "default" : "secondary"}>
                        {contestData.isPublic ? 'Public' : 'Private'}
                    </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-4">{contestData.title}</h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    {contestData.description || 'No description available'}
                </p>
            </div>

            {/* Contest Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Start Time</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDateTime(contestData.startTime)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">End Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDateTime(contestData.endTime)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatDuration(contestData.startTime, contestData.endTime)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Participants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{contestData.participants}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mb-8">
                {isActive && (
                    <Button
                        size="lg"
                        onClick={() => window.location.href = `/contests/${contestId}`}
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Enter Contest
                    </Button>
                )}

                {isUpcoming && (
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={registerForContest}
                        disabled={registering}
                    >
                        {registering ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                            <UserPlus className="w-5 h-5 mr-2" />
                        )}
                        {registering ? 'Registering...' : 'Register for Contest'}
                    </Button>
                )}
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="problems">Problems</TabsTrigger>
                    <TabsTrigger value="rules">Rules</TabsTrigger>
                    <TabsTrigger value="prizes">Prizes</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="w-5 h-5" />
                                    Contest Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2">What is this contest?</h4>
                                    <p className="text-muted-foreground">
                                        This is a competitive programming contest where participants solve algorithmic problems
                                        within a time limit. Test your problem-solving skills and compete with other programmers!
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">How to participate?</h4>
                                    <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                                        <li>Register for the contest before it starts</li>
                                        <li>Read problem statements carefully</li>
                                        <li>Write and submit your solutions</li>
                                        <li>Check your results and standings</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    Contest Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600">{contestData.problems.length}</div>
                                        <div className="text-sm text-muted-foreground">Problems</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600">{contestData.totalPoints}</div>
                                        <div className="text-sm text-muted-foreground">Total Points</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Problems Tab */}
                <TabsContent value="problems" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Contest Problems
                            </CardTitle>
                            <CardDescription>
                                {contestData.problems.length} problems • {contestData.totalPoints} total points
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {contestData.problems.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="w-8 h-8 mx-auto mb-2" />
                                    <p>No problems added to this contest yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {contestData.problems.map((problem) => (
                                        <div key={problem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline" className="font-mono">
                                                    #{problem.order}
                                                </Badge>
                                                <div>
                                                    <h4 className="font-semibold">{problem.title}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Time: {problem.timeLimit}ms • Memory: {problem.memoryLimit}MB
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">{problem.points} pts</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Rules Tab */}
                <TabsContent value="rules" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Ruler className="w-5 h-5" />
                                Contest Rules
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">General Rules</h4>
                                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                                    <li>You must be registered for the contest to participate</li>
                                    <li>Solutions must be submitted before the contest ends</li>
                                    <li>You can submit multiple solutions to the same problem</li>
                                    <li>Only your best score for each problem counts</li>
                                    <li>Plagiarism is strictly prohibited</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Scoring System</h4>
                                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                                    <li>Each problem has a specific point value</li>
                                    <li>Points are awarded based on test case performance</li>
                                    <li>Wrong submissions may incur penalty points</li>
                                    <li>Final ranking is determined by total score and penalty time</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Allowed Programming Languages</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <Badge variant="outline">C++</Badge>
                                    <Badge variant="outline">Java</Badge>
                                    <Badge variant="outline">Python</Badge>
                                    <Badge variant="outline">JavaScript</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Prizes Tab */}
                <TabsContent value="prizes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Prizes and Recognition
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center py-8">
                                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                                <h3 className="text-xl font-semibold mb-2">🏆 Contest Winners</h3>
                                <p className="text-muted-foreground">
                                    Top performers will be recognized on the leaderboard and receive special badges.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="text-center">
                                    <CardContent className="p-6">
                                        <div className="text-3xl mb-2">🥇</div>
                                        <h4 className="font-semibold">1st Place</h4>
                                        <p className="text-sm text-muted-foreground">Highest score with lowest penalty</p>
                                    </CardContent>
                                </Card>
                                <Card className="text-center">
                                    <CardContent className="p-6">
                                        <div className="text-3xl mb-2">🥈</div>
                                        <h4 className="font-semibold">2nd Place</h4>
                                        <p className="text-sm text-muted-foreground">Second highest score</p>
                                    </CardContent>
                                </Card>
                                <Card className="text-center">
                                    <CardContent className="p-6">
                                        <div className="text-3xl mb-2">🥉</div>
                                        <h4 className="font-semibold">3rd Place</h4>
                                        <p className="text-sm text-muted-foreground">Third highest score</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
