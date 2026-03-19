"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Target, Clock, Edit, Trash2, Eye, Search, Filter, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddProblemModal from "@/components/contest/add-problem-modal";

interface ContestProblem {
    id: number;
    contestId: number;
    contestTitle: string;
    problemId: number;
    problemTitle: string;
    problemDescription: string;
    difficulty: string;
    points: number;
    order: number;
    submissions: number;
    solvedCount: number;
    averageScore: number;
}

export default function ContestProblems() {
    const [problems, setProblems] = useState<ContestProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const [contestFilter, setContestFilter] = useState<string>('all');
    const [showAddProblemModal, setShowAddProblemModal] = useState(false);
    const [selectedContestId, setSelectedContestId] = useState<number>(0);

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/admin/contests/problems');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setProblems(data.problems || []);
            } else {
                throw new Error(data.error || 'Failed to fetch problems');
            }
        } catch (error) {
            console.error('Error fetching problems:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch problems');
            // Fallback to empty array instead of dummy data
            setProblems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProblemSuccess = () => {
        fetchProblems();
        setShowAddProblemModal(false);
    };

    const handleAddProblemToContest = (contestId: number) => {
        setSelectedContestId(contestId);
        setShowAddProblemModal(true);
    };

    const handleDeleteProblem = async (problemId: number) => {
        if (!confirm('Are you sure you want to remove this problem from the contest?')) return;

        try {
            // In a real app, call API to remove problem from contest
            // For now, just remove from local state
            setProblems(prev => prev.filter(p => p.id !== problemId));
        } catch (error) {
            console.error('Error deleting problem:', error);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy':
                return 'bg-green-100 text-green-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'hard':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDifficultyIcon = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy':
                return '🟢';
            case 'medium':
                return '🟡';
            case 'hard':
                return '🔴';
            default:
                return '⚪';
        }
    };

    const filteredProblems = problems.filter(problem => {
        const matchesSearch =
            problem.problemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            problem.contestTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            problem.problemDescription.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
        const matchesContest = contestFilter === 'all' || problem.contestId.toString() === contestFilter;
        return matchesSearch && matchesDifficulty && matchesContest;
    });

    // Get unique contests for filter
    const uniqueContests = Array.from(new Set(problems.map(p => ({ id: p.contestId, title: p.contestTitle }))));

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading contest problems...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">
                            <FileText className="w-16 h-16 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Error Loading Problems</h2>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <Button onClick={fetchProblems} variant="outline">
                                Try Again
                            </Button>
                        </div>
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
                        <FileText className="w-8 h-8 text-blue-500" />
                        Contest Problems
                    </h1>
                    <p className="text-muted-foreground">
                        Manage problems across all contests
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedContestId(0);
                        setShowAddProblemModal(true);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Problem to Contest
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{problems.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {problems.reduce((sum, p) => sum + p.points, 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {problems.reduce((sum, p) => sum + p.submissions, 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Contests</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {uniqueContests.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search problems or contests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Difficulties" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Difficulties</SelectItem>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={contestFilter} onValueChange={setContestFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Contests" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Contests</SelectItem>
                                {uniqueContests.map(contest => (
                                    <SelectItem key={contest.id} value={contest.id.toString()}>
                                        {contest.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Problems List */}
            <Card>
                <CardHeader>
                    <CardTitle>Problems ({filteredProblems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredProblems.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Problems Found</h3>
                            <p className="text-muted-foreground mb-4">
                                {problems.length === 0
                                    ? "No problems have been added to any contests yet."
                                    : "No problems match your current filters."}
                            </p>
                            {problems.length === 0 && (
                                <Button
                                    onClick={() => {
                                        setSelectedContestId(0);
                                        setShowAddProblemModal(true);
                                    }}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First Problem
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredProblems.map((problem, index) => (
                                <div key={problem.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge variant="outline" className="font-mono">
                                                    #{problem.order}
                                                </Badge>
                                                <h3 className="text-lg font-semibold">{problem.problemTitle}</h3>
                                                <Badge className={getDifficultyColor(problem.difficulty)}>
                                                    {getDifficultyIcon(problem.difficulty)} {problem.difficulty}
                                                </Badge>
                                                <Badge variant="secondary">
                                                    {problem.points} pts
                                                </Badge>
                                            </div>
                                            <div className="mb-2">
                                                <Badge variant="outline" className="text-xs">
                                                    <Trophy className="w-3 h-3 mr-1" />
                                                    {problem.contestTitle}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {problem.problemDescription}
                                            </p>
                                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <FileText className="w-4 h-4" />
                                                    <span>{problem.submissions} submissions</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Target className="w-4 h-4" />
                                                    <span>{problem.solvedCount} solved</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Avg: {problem.averageScore}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddProblemToContest(problem.contestId)}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteProblem(problem.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Problem Modal */}
            <AddProblemModal
                isOpen={showAddProblemModal}
                onClose={() => setShowAddProblemModal(false)}
                onSuccess={handleAddProblemSuccess}
                contestId={selectedContestId}
            />
        </div>
    );
}
