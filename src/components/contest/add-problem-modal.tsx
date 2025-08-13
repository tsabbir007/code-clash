"use client";

import { useState, useEffect } from 'react';
import { X, Plus, Search, AlertCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    description: string;
}

interface Contest {
    id: number;
    title: string;
    description: string;
}

interface AddProblemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contestId: number;
}

export default function AddProblemModal({ isOpen, onClose, onSuccess, contestId }: AddProblemModalProps) {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [contests, setContests] = useState<Contest[]>([]);
    const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
    const [selectedContestId, setSelectedContestId] = useState<number>(contestId);
    const [points, setPoints] = useState(100);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Update selected contest when contestId prop changes
    useEffect(() => {
        setSelectedContestId(contestId);
    }, [contestId]);

    // Fetch available problems
    useEffect(() => {
        if (isOpen) {
            fetchProblems();
            if (contestId === 0) {
                fetchContests();
            }
        }
    }, [isOpen, contestId]);

    // Filter problems based on search
    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = problems.filter(problem =>
                problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                problem.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProblems(filtered);
        } else {
            setFilteredProblems(problems);
        }
    }, [searchQuery, problems]);

    const fetchProblems = async () => {
        try {
            const response = await fetch('/api/problems/public');
            if (response.ok) {
                const data = await response.json();
                setProblems(data.problems || []);
                setFilteredProblems(data.problems || []);
            }
        } catch (error) {
            console.error('Error fetching problems:', error);
            // Fallback to demo data
            setProblems([
                {
                    id: 1,
                    title: "Two Sum",
                    difficulty: "Easy",
                    description: "Find two numbers that add up to a target"
                },
                {
                    id: 2,
                    title: "Binary Tree Traversal",
                    difficulty: "Medium",
                    description: "Implement inorder, preorder, and postorder traversal"
                },
                {
                    id: 3,
                    title: "Dynamic Programming",
                    difficulty: "Hard",
                    description: "Solve optimization problems using dynamic programming"
                }
            ]);
            setFilteredProblems([
                {
                    id: 1,
                    title: "Two Sum",
                    difficulty: "Easy",
                    description: "Find two numbers that add up to a target"
                },
                {
                    id: 2,
                    title: "Binary Tree Traversal",
                    difficulty: "Medium",
                    description: "Implement inorder, preorder, and postorder traversal"
                },
                {
                    id: 3,
                    title: "Dynamic Programming",
                    difficulty: "Hard",
                    description: "Solve optimization problems using dynamic programming"
                }
            ]);
        }
    };

    const fetchContests = async () => {
        try {
            const response = await fetch('/api/admin/contests');
            if (response.ok) {
                const data = await response.json();
                setContests(data.contests || []);
            }
        } catch (error) {
            console.error('Error fetching contests:', error);
            // Fallback to demo data
            setContests([
                {
                    id: 1,
                    title: "Code Clash 2024",
                    description: "Annual programming contest for competitive programmers"
                },
                {
                    id: 2,
                    title: "Algorithm Masters",
                    description: "Advanced algorithmic problem solving contest"
                }
            ]);
        }
    };

    const handleProblemSelect = (problem: Problem) => {
        setSelectedProblem(problem);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProblem) {
            setError('Please select a problem');
            return;
        }

        if (selectedContestId === 0) {
            setError('Please select a contest');
            return;
        }

        if (points < 1 || points > 10000) {
            setError('Points must be between 1 and 10,000');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin/contests/${selectedContestId}/problems`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    problemId: selectedProblem.id,
                    points: points
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add problem to contest');
            }

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
                resetForm();
            }, 1500);

        } catch (err) {
            console.error('Error adding problem to contest:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedProblem(null);
        setSelectedContestId(contestId);
        setPoints(100);
        setSearchQuery('');
        setError(null);
        setSuccess(false);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Plus className="w-6 h-6" />
                        Add Problem to Contest
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="text-green-800">
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>Problem added to contest successfully!</AlertDescription>
                        </Alert>
                    )}

                    {/* Contest Selection (only show if no specific contest is selected) */}
                    {contestId === 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Trophy className="w-5 h-5" />
                                Select Contest
                            </h3>

                            <div className="space-y-2">
                                <Label htmlFor="contest">Contest *</Label>
                                <Select value={selectedContestId.toString()} onValueChange={(value) => setSelectedContestId(parseInt(value))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a contest" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contests.map(contest => (
                                            <SelectItem key={contest.id} value={contest.id.toString()}>
                                                {contest.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedContestId > 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        {contests.find(c => c.id === selectedContestId)?.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Problem Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Select Problem</h3>

                        <div className="space-y-2">
                            <Label htmlFor="search">Search Problems</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    id="search"
                                    placeholder="Search by title or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Problem List */}
                        <div className="border rounded-lg max-h-64 overflow-y-auto">
                            {filteredProblems.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    No problems found
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredProblems.map((problem) => (
                                        <div
                                            key={problem.id}
                                            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedProblem?.id === problem.id ? 'bg-muted' : ''
                                                }`}
                                            onClick={() => handleProblemSelect(problem)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{problem.title}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {problem.description}
                                                    </p>
                                                </div>
                                                <Badge className={getDifficultyColor(problem.difficulty)}>
                                                    {problem.difficulty}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Points Configuration */}
                    {selectedProblem && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Problem Configuration</h3>

                            <div className="p-4 border rounded-lg bg-muted/30">
                                <h4 className="font-medium mb-2">Selected Problem: {selectedProblem.title}</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {selectedProblem.description}
                                </p>

                                <div className="space-y-2">
                                    <Label htmlFor="points">Points *</Label>
                                    <Input
                                        id="points"
                                        type="number"
                                        value={points}
                                        onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                                        min="1"
                                        max="10000"
                                        disabled={loading}
                                        className="w-32"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Points awarded for solving this problem
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !selectedProblem || (contestId === 0 && selectedContestId === 0)}
                            className="min-w-[120px]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Adding...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Problem
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
