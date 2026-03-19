"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { toast } from 'sonner';

interface Problem {
    id: number;
    title: string;
    statement: string | null;
}

export default function StatementPage() {
    const params = useParams();
    const problemId = params.problemId as string;

    const [problem, setProblem] = useState<Problem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [statement, setStatement] = useState('');

    useEffect(() => {
        loadProblem();
    }, [problemId]);

    const loadProblem = async () => {
        try {
            const response = await fetch(`/api/problems/${problemId}`);
            const data = await response.json();

            if (data.success) {
                setProblem(data.problem);
                setStatement(data.problem.statement || '');
            } else {
                toast.error(data.error || 'Failed to load problem');
            }
        } catch (error) {
            console.error('Error loading problem:', error);
            toast.error('Failed to load problem');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (content: string) => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/problems/${problemId}/statement`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ statement: content }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Statement saved successfully!');
                setStatement(content);
            } else {
                toast.error(data.error || 'Failed to save statement');
            }
        } catch (error) {
            console.error('Error saving statement:', error);
            toast.error('Failed to save statement');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading problem...</div>
                </div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-red-500">Problem not found</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Problem Statement</h1>
                <p className="text-muted-foreground">
                    Edit the statement for problem: {problem.title}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Statement Editor</CardTitle>
                </CardHeader>
                <CardContent>
                    <SimpleEditor
                        initialContent={statement}
                        onSave={handleSave}
                        showSaveButton={true}
                    />
                    {isSaving && (
                        <div className="mt-4 text-sm text-muted-foreground">
                            Saving...
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}