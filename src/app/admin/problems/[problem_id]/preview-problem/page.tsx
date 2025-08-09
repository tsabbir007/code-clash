'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Copy } from 'lucide-react';

interface TestCase {
    id: number;
    label: string;
    input: string;
    output: string;
    isSample: boolean;
    isHidden: boolean;
}

interface ProblemPreview {
    id: number;
    title: string;
    statement: string;
    timeLimit: number;
    memoryLimit: number;
    checkerType: string;
    customChecker: string;
    createdAt: string;
    updatedAt: string;
}

export default function PreviewProblemPage() {
    const params = useParams();
    const problemId = params.problem_id as string;

    const [problem, setProblem] = useState<ProblemPreview | null>(null);
    const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>([]);
    const [totalTestCases, setTotalTestCases] = useState(0);
    const [hiddenTestCases, setHiddenTestCases] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProblemPreview();
    }, [problemId]);

    const fetchProblemPreview = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/problems/${problemId}/preview`);
            const data = await response.json();

            if (data.success) {
                setProblem(data.problem);
                setSampleTestCases(data.sampleTestCases);
                setTotalTestCases(data.totalTestCases);
                setHiddenTestCases(data.hiddenTestCases);
            } else {
                toast.error(data.error || 'Failed to fetch problem preview');
            }
        } catch (error) {
            console.error('Error fetching problem preview:', error);
            toast.error('Failed to fetch problem preview');
        } finally {
            setLoading(false);
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

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${type} copied to clipboard!`);
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy to clipboard');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading problem preview...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="container mx-auto p-6">
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
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Problem Header */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">{problem.title}</CardTitle>
                            <p className="text-muted-foreground mt-2">Problem ID: {problem.id}</p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline">
                                {formatTimeLimit(problem.timeLimit)} time limit
                            </Badge>
                            <Badge variant="outline">
                                {formatMemoryLimit(problem.memoryLimit)} memory limit
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Problem Statement */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Problem Statement</CardTitle>
                </CardHeader>
                <CardContent>
                    {problem.statement ? (
                        <div className="prose prose-sm max-w-none">
                            <SimpleEditor
                                initialContent={problem.statement}
                                showSaveButton={false}
                                readOnly={true}
                            />
                        </div>
                    ) : (
                        <p className="text-muted-foreground italic">No problem statement available.</p>
                    )}
                </CardContent>
            </Card>

            {/* Sample Test Cases */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Sample Test Cases</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {sampleTestCases.length} sample test case{sampleTestCases.length !== 1 ? 's' : ''}
                        • {totalTestCases} total test cases ({hiddenTestCases} hidden)
                    </p>
                </CardHeader>
                <CardContent>
                    {sampleTestCases.length > 0 ? (
                        <div className="space-y-6">
                            {sampleTestCases.map((testCase, index) => (
                                <div key={testCase.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold">Sample {index + 1}</h4>
                                        <Badge variant="secondary">{testCase.label}</Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-medium text-sm text-green-700">Input</h5>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(testCase.input);
                                                        toast.success('Input copied to clipboard');
                                                    }}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <pre className="p-3 rounded text-sm overflow-x-auto">
                                                <code>{testCase.input}</code>
                                            </pre>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-medium text-sm text-blue-700">Expected Output</h5>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(testCase.output);
                                                        toast.success('Output copied to clipboard');
                                                    }}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <pre className="p-3 rounded text-sm overflow-x-auto">
                                                <code>{testCase.output}</code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground italic">No sample test cases available.</p>
                    )}
                </CardContent>
            </Card>

            {/* Problem Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Problem Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-3">Limits</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time Limit:</span>
                                    <span className="font-mono">{formatTimeLimit(problem.timeLimit)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Memory Limit:</span>
                                    <span className="font-mono">{formatMemoryLimit(problem.memoryLimit)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Checker Type:</span>
                                    <Badge variant="outline">{problem.checkerType}</Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">Statistics</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Test Cases:</span>
                                    <span className="font-mono">{totalTestCases}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sample Test Cases:</span>
                                    <span className="font-mono">{sampleTestCases.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Hidden Test Cases:</span>
                                    <span className="font-mono">{hiddenTestCases}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-3">Timestamps</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created:</span>
                                    <span className="text-sm">{new Date(problem.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Updated:</span>
                                    <span className="text-sm">{new Date(problem.updatedAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {problem.customChecker && (
                            <div>
                                <h4 className="font-semibold mb-3">Custom Checker</h4>
                                <p className="text-sm text-muted-foreground">
                                    This problem uses a custom checker for validation.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
