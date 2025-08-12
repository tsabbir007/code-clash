"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Target, Clock, Edit, Trash2, Eye, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddProblemModal from "@/components/contest/add-problem-modal";

interface ContestProblem {
    id: number;
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

export default function ContestProblems({ params }: { params: { id: string } }) {
    const [problems, setProblems] = useState<ContestProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const [showAddProblemModal, setShowAddProblemModal] = useState(false);

    const contestId = parseInt(params.id);

    useEffect(() => {
        fetchProblems();
    }, [contestId]);

    const fetchProblems = async () => {
        try {
            setLoading(true);
            // Mock data for now
            const mockProblems: ContestProblem[] = [
                {
                    id: 1,
                    problemId: 1,
                    problemTitle: "Two Sum",
                    problemDescription: "Find two numbers that add up to a target value",
                    difficulty: "Easy",
                    points: 100,
                    order: 1,
                    submissions: 45,
                    solvedCount: 38,
                    averageScore: 85
                },
                {
                    id: 2,
                    problemId: 2,
                    problemTitle: "Binary Tree Traversal",
                    problemDescription: "Implement inorder, preorder, and postorder traversal",
                    difficulty: "Medium",
                    points: 200,
                    order: 2,
                    submissions: 32,
                    solvedCount: 18,
                    averageScore: 65
                },
                {
                    id: 3,
                    problemId: 3,
                    problemTitle: "Dynamic Programming",
                    problemDescription: "Solve optimization problems using dynamic programming",
                    difficulty: "Hard",
                    points: 300,
                    order: 3,
                    submissions: 28,
                    solvedCount: 12,
                    averageScore: 45
                }
            ];
            setProblems(mockProblems);
        } catch (error) {
            console.error('Error fetching problems:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProblemSuccess = () => {
        fetchProblems();
        setShowAddProblemModal(false);
    };

    const handleReorderProblems = (fromIndex: number, toIndex: number) => {
        const newProblems = [...problems];
        const [movedProblem] = newProblems.splice(fromIndex, 1);
        newProblems.splice(toIndex, 0, movedProblem);

        // Update order numbers
        newProblems.forEach((problem, index) => {
            problem.order = index + 1;
        });

        setProblems(newProblems);
    };

    const handleDeleteProblem = async (problemId: number) => {
        if (!confirm('Are you sure you want to remove this problem from the contest?')) return;

        try {
            // In a real app, call API to remove problem from contest
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
            problem.problemDescription.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
        return matchesSearch && matchesDifficulty;
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading problems...</p>
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
                        Manage problems and their configuration
                    </p>
                </div>
                <Button onClick={() => setShowAddProblemModal(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Problem
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
                        <CardTitle className="text-sm font-medium">Solved Problems</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {problems.reduce((sum, p) => sum + p.solvedCount, 0)}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search problems..."
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
                    </div>
                </CardContent>
            </Card>

            {/* Problems List */}
            <Card>
                <CardHeader>
                    <CardTitle>Problems ({filteredProblems.length})</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>

            {/* Add Problem Modal */}
            <AddProblemModal
                isOpen={showAddProblemModal}
                onClose={() => setShowAddProblemModal(false)}
                onSuccess={handleAddProblemSuccess}
                contestId={contestId}
            />
        </div>
    );
}
