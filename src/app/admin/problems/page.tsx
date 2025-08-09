"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';

interface Problem {
    id: number;
    title: string;
    statement: string | null;
    createdAt: string;
    updatedAt: string;
    userName: string;
    userEmail: string;
}

export default function AdminProblemsPage() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newProblemName, setNewProblemName] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        loadProblems();
    }, []);

    const loadProblems = async () => {
        try {
            const response = await fetch('/api/problems');
            const data = await response.json();

            if (data.success) {
                setProblems(data.problems);
            } else {
                toast.error(data.error || 'Failed to load problems');
            }
        } catch (error) {
            console.error('Error loading problems:', error);
            toast.error('Failed to load problems');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProblem = async () => {
        if (!newProblemName.trim()) {
            toast.error('Problem name is required');
            return;
        }

        setIsCreating(true);
        try {
            const response = await fetch('/api/problems', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newProblemName }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                setNewProblemName('');
                setIsDialogOpen(false);
                loadProblems(); // Reload the list
            } else {
                toast.error(data.error || 'Failed to create problem');
            }
        } catch (error) {
            console.error('Error creating problem:', error);
            toast.error('Failed to create problem');
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading problems...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Problems</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Create Problem</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Problem</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="problem-name">Problem Name</Label>
                                <Input
                                    id="problem-name"
                                    value={newProblemName}
                                    onChange={(e) => setNewProblemName(e.target.value)}
                                    placeholder="Enter problem name"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateProblem} disabled={isCreating}>
                                    {isCreating ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {problems.length === 0 ? (
                    <Card>
                        <CardContent className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <p className="text-muted-foreground">No problems found</p>
                                <p className="text-sm text-muted-foreground">Create your first problem to get started</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    problems.map((problem) => (
                        <Card key={problem.id}>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{problem.title}</span>
                                    <Link href={`/admin/problems/${problem.id}/overview`}>
                                        <Button variant="outline" size="sm">
                                            Enter Overview
                                        </Button>
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">ID:</span> {problem.id}
                                    </div>
                                    <div>
                                        <span className="font-medium">Owner:</span> {problem.userName || 'Unknown'}
                                    </div>
                                    <div>
                                        <span className="font-medium">My Role:</span> Owner
                                    </div>
                                    <div>
                                        <span className="font-medium">Created:</span> {new Date(problem.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}