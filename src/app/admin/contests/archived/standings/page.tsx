"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Clock, TrendingUp, Users, Target, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Participant {
    id: number;
    userId: string;
    userName: string;
    userEmail: string;
    totalScore: number;
    problemsSolved: number;
    penalty: number;
    lastSubmissionTime: string;
    problemResults: ProblemResult[];
}

interface ProblemResult {
    problemId: number;
    problemTitle: string;
    score: number;
    attempts: number;
    status: 'solved' | 'attempted' | 'unsolved';
    bestSubmissionTime?: string;
}

interface Problem {
    id: number;
    title: string;
    points: number;
    order: number;
}

export default function ContestStandings({ params }: { params: { id: string } }) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'score' | 'problems' | 'penalty'>('score');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const contestId = parseInt(params.id);

    useEffect(() => {
        fetchStandings();
    }, [contestId]);

    const fetchStandings = async () => {
        try {
            setLoading(true);
            // In a real app, fetch from API
            // For now, using mock data
            const mockProblems: Problem[] = [
                { id: 1, title: "Two Sum", points: 100, order: 1 },
                { id: 2, title: "Binary Tree", points: 200, order: 2 },
                { id: 3, title: "Dynamic Programming", points: 300, order: 3 }
            ];

            const mockParticipants: Participant[] = [
                {
                    id: 1,
                    userId: "user1",
                    userName: "Alice Johnson",
                    userEmail: "alice@example.com",
                    totalScore: 450,
                    problemsSolved: 3,
                    penalty: 45,
                    lastSubmissionTime: "2024-12-15T14:30:00Z",
                    problemResults: [
                        { problemId: 1, problemTitle: "Two Sum", score: 100, attempts: 1, status: 'solved', bestSubmissionTime: "2024-12-15T10:15:00Z" },
                        { problemId: 2, problemTitle: "Binary Tree", score: 200, attempts: 2, status: 'solved', bestSubmissionTime: "2024-12-15T12:20:00Z" },
                        { problemId: 3, problemTitle: "Dynamic Programming", score: 150, attempts: 3, status: 'solved', bestSubmissionTime: "2024-12-15T14:30:00Z" }
                    ]
                },
                {
                    id: 2,
                    userId: "user2",
                    userName: "Bob Smith",
                    userEmail: "bob@example.com",
                    totalScore: 300,
                    problemsSolved: 2,
                    penalty: 30,
                    lastSubmissionTime: "2024-12-15T13:45:00Z",
                    problemResults: [
                        { problemId: 1, problemTitle: "Two Sum", score: 100, attempts: 1, status: 'solved', bestSubmissionTime: "2024-12-15T10:10:00Z" },
                        { problemId: 2, problemTitle: "Binary Tree", score: 200, attempts: 1, status: 'solved', bestSubmissionTime: "2024-12-15T12:15:00Z" },
                        { problemId: 3, problemTitle: "Dynamic Programming", score: 0, attempts: 2, status: 'attempted' }
                    ]
                },
                {
                    id: 3,
                    userId: "user3",
                    userName: "Charlie Brown",
                    userEmail: "charlie@example.com",
                    totalScore: 100,
                    problemsSolved: 1,
                    penalty: 15,
                    lastSubmissionTime: "2024-12-15T11:30:00Z",
                    problemResults: [
                        { problemId: 1, problemTitle: "Two Sum", score: 100, attempts: 1, status: 'solved', bestSubmissionTime: "2024-12-15T10:05:00Z" },
                        { problemId: 2, problemTitle: "Binary Tree", score: 0, attempts: 1, status: 'attempted' },
                        { problemId: 3, problemTitle: "Dynamic Programming", score: 0, attempts: 0, status: 'unsolved' }
                    ]
                }
            ];

            setProblems(mockProblems);
            setParticipants(mockParticipants);
        } catch (error) {
            console.error('Error fetching standings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
    };

    const getProblemStatusColor = (status: string) => {
        switch (status) {
            case 'solved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'attempted':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'unsolved':
                return 'bg-gray-100 text-gray-600 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const getProblemStatusIcon = (status: string) => {
        switch (status) {
            case 'solved':
                return '✓';
            case 'attempted':
                return '!';
            case 'unsolved':
                return '—';
            default:
                return '—';
        }
    };

    const formatTime = (timeString: string) => {
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    // Filter and sort participants
    const filteredAndSortedParticipants = participants
        .filter(participant =>
            participant.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            participant.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'score':
                    comparison = b.totalScore - a.totalScore;
                    break;
                case 'problems':
                    comparison = b.problemsSolved - a.problemsSolved;
                    break;
                case 'penalty':
                    comparison = a.penalty - b.penalty;
                    break;
            }
            return sortOrder === 'desc' ? comparison : -comparison;
        });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading standings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        Contest Standings
                    </h1>
                    <p className="text-muted-foreground">
                        Real-time rankings and problem status
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{participants.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Problems</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{problems.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Score</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.max(...participants.map(p => p.totalScore))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Penalty</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.round(participants.reduce((sum, p) => sum + p.penalty, 0) / participants.length)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search participants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                </div>

                <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={(value: 'score' | 'problems' | 'penalty') => setSortBy(value)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="score">Score</SelectItem>
                            <SelectItem value="problems">Problems</SelectItem>
                            <SelectItem value="penalty">Penalty</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    >
                        <TrendingUp className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Standings Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 font-medium">Rank</th>
                                    <th className="text-left p-3 font-medium">Participant</th>
                                    <th className="text-center p-3 font-medium">Score</th>
                                    <th className="text-center p-3 font-medium">Solved</th>
                                    <th className="text-center p-3 font-medium">Penalty</th>
                                    {problems.map(problem => (
                                        <th key={problem.id} className="text-center p-3 font-medium min-w-[100px]">
                                            <div className="text-xs">
                                                <div className="font-medium">{problem.title}</div>
                                                <div className="text-muted-foreground">{problem.points} pts</div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedParticipants.map((participant, index) => (
                                    <tr key={participant.id} className="border-b hover:bg-muted/50">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                {getRankIcon(index + 1)}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div>
                                                <div className="font-medium">{participant.userName}</div>
                                                <div className="text-sm text-muted-foreground">{participant.userEmail}</div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center font-bold text-lg">
                                            {participant.totalScore}
                                        </td>
                                        <td className="p-3 text-center">
                                            <Badge variant="secondary">
                                                {participant.problemsSolved}/{problems.length}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-center text-sm text-muted-foreground">
                                            {formatDuration(participant.penalty)}
                                        </td>
                                        {problems.map(problem => {
                                            const result = participant.problemResults.find(r => r.problemId === problem.id);
                                            return (
                                                <td key={problem.id} className="p-3 text-center">
                                                    {result ? (
                                                        <div className="space-y-1">
                                                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium ${getProblemStatusColor(result.status)}`}>
                                                                {getProblemStatusIcon(result.status)}
                                                            </div>
                                                            {result.attempts > 0 && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {result.attempts} {result.attempts === 1 ? 'try' : 'tries'}
                                                                </div>
                                                            )}
                                                            {result.score > 0 && (
                                                                <div className="text-xs font-medium text-green-600">
                                                                    +{result.score}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted-foreground">—</div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {participants
                            .sort((a, b) => new Date(b.lastSubmissionTime).getTime() - new Date(a.lastSubmissionTime).getTime())
                            .slice(0, 5)
                            .map(participant => (
                                <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="font-medium">{participant.userName}</span>
                                        <span className="text-muted-foreground">submitted a solution</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {formatTime(participant.lastSubmissionTime)}
                                    </span>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
