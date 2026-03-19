"use client";

import { useState } from "react";
import { Trophy, Medal, TrendingUp, Clock, Award, Users, Target } from "lucide-react";

interface Participant {
    id: string;
    name: string;
    rank: number;
    totalScore: number;
    problemsSolved: number;
    penalty: number;
    lastSubmissionTime: string;
    problems: {
        [key: string]: {
            score: number;
            attempts: number;
            firstAccepted: string | null;
            status: 'solved' | 'attempted' | 'unsolved';
        };
    };
}

export default function ContestStandings() {
    const [participants] = useState<Participant[]>([
        {
            id: "1",
            name: "John Smith",
            rank: 1,
            totalScore: 100,
            problemsSolved: 1,
            penalty: 0,
            lastSubmissionTime: "2024-12-15T14:30:00Z",
            problems: {
                "Hello World": {
                    score: 100,
                    attempts: 1,
                    firstAccepted: "2024-12-15T14:30:00Z",
                    status: 'solved'
                },
                "Array Sum": {
                    score: 0,
                    attempts: 1,
                    firstAccepted: null,
                    status: 'attempted'
                }
            }
        },
        {
            id: "2",
            name: "Jane Doe",
            rank: 2,
            totalScore: 0,
            problemsSolved: 0,
            penalty: 0,
            lastSubmissionTime: "2024-12-15T14:20:00Z",
            problems: {
                "Hello World": {
                    score: 0,
                    attempts: 1,
                    firstAccepted: null,
                    status: 'attempted'
                },
                "Array Sum": {
                    score: 0,
                    attempts: 1,
                    firstAccepted: null,
                    status: 'attempted'
                }
            }
        }
    ]);

    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [problems] = useState(["Hello World", "Array Sum"]);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 2: return <Medal className="w-5 h-5 text-gray-400" />;
            case 3: return <Medal className="w-5 h-5 text-amber-600" />;
            default: return <span className="w-5 h-5 text-center text-sm font-medium">{rank}</span>;
        }
    };

    const getProblemStatusColor = (status: string) => {
        switch (status) {
            case 'solved': return 'bg-green-100 text-green-800';
            case 'attempted': return 'bg-yellow-100 text-yellow-800';
            case 'unsolved': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getProblemStatusIcon = (status: string) => {
        switch (status) {
            case 'solved': return <Award className="w-4 h-4" />;
            case 'attempted': return <Clock className="w-4 h-4" />;
            case 'unsolved': return <Target className="w-4 h-4" />;
            default: return <Target className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Standings</h1>
                <p className="text-muted-foreground">
                    View contest rankings and scores
                </p>
            </div>

            {/* Contest Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total Participants</p>
                            <p className="text-2xl font-bold text-blue-600">{participants.length}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-sm text-muted-foreground">Problems Solved</p>
                            <p className="text-2xl font-bold text-green-600">
                                {participants.reduce((sum, p) => sum + p.problemsSolved, 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-purple-50">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total Score</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {participants.reduce((sum, p) => sum + p.totalScore, 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-orange-50">
                    <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-orange-600" />
                        <div>
                            <p className="text-sm text-muted-foreground">Average Penalty</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {Math.round(participants.reduce((sum, p) => sum + p.penalty, 0) / participants.length)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Standings Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="p-4 border-b bg-muted/50">
                    <h3 className="font-semibold">Current Rankings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30">
                            <tr>
                                <th className="text-left p-3 font-medium">Rank</th>
                                <th className="text-left p-3 font-medium">Participant</th>
                                <th className="text-left p-3 font-medium">Score</th>
                                <th className="text-left p-3 font-medium">Problems Solved</th>
                                <th className="text-left p-3 font-medium">Penalty</th>
                                {problems.map(problem => (
                                    <th key={problem} className="text-center p-3 font-medium text-sm">
                                        {problem}
                                    </th>
                                ))}
                                <th className="text-left p-3 font-medium">Last Submission</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants.map((participant) => (
                                <tr key={participant.id} className="border-b hover:bg-muted/30 transition-colors">
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            {getRankIcon(participant.rank)}
                                        </div>
                                    </td>
                                    <td className="p-3 font-medium">
                                        <button
                                            onClick={() => setSelectedParticipant(participant)}
                                            className="text-left hover:text-blue-600 transition-colors"
                                        >
                                            {participant.name}
                                        </button>
                                    </td>
                                    <td className="p-3 font-bold text-lg">{participant.totalScore}</td>
                                    <td className="p-3">{participant.problemsSolved}</td>
                                    <td className="p-3">{participant.penalty}</td>
                                    {problems.map(problem => {
                                        const problemData = participant.problems[problem];
                                        return (
                                            <td key={problem} className="p-3 text-center">
                                                {problemData ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getProblemStatusColor(problemData.status)}`}>
                                                            {getProblemStatusIcon(problemData.status)}
                                                            {problemData.status === 'solved' ? problemData.score : problemData.attempts}
                                                        </span>
                                                        {problemData.firstAccepted && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(problemData.firstAccepted).toLocaleTimeString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="p-3 text-sm text-muted-foreground">
                                        {new Date(participant.lastSubmissionTime).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Problem Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-4">Problem Statistics</h3>
                    <div className="space-y-3">
                        {problems.map(problem => {
                            const solvedCount = participants.filter(p => p.problems[problem]?.status === 'solved').length;
                            const attemptedCount = participants.filter(p => p.problems[problem]?.status === 'attempted' || p.problems[problem]?.status === 'solved').length;
                            const successRate = attemptedCount > 0 ? (solvedCount / attemptedCount * 100).toFixed(1) : 0;

                            return (
                                <div key={problem} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <h4 className="font-medium">{problem}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {solvedCount} solved, {attemptedCount} attempted
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-600">{successRate}%</p>
                                        <p className="text-xs text-muted-foreground">Success Rate</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">John Smith solved "Hello World"</p>
                                <p className="text-xs text-muted-foreground">2 minutes ago</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Jane Doe attempted "Array Sum"</p>
                                <p className="text-xs text-muted-foreground">5 minutes ago</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">New participant joined</p>
                                <p className="text-xs text-muted-foreground">10 minutes ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
