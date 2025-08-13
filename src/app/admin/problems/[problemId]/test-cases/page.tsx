"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Download } from 'lucide-react';

interface TestCase {
    id: number;
    label: string;
    input: string;
    output: string;
    points: number;
    isSample: boolean;
    createdAt: string;
}

interface Problem {
    id: number;
    title: string;
}

export default function TestCasesPage() {
    const params = useParams();
    const problemId = params.problemId as string;

    const [problem, setProblem] = useState<Problem | null>(null);
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [label, setLabel] = useState('');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [points, setPoints] = useState(1);
    const [isSample, setIsSample] = useState(false);

    useEffect(() => {
        loadTestCases();
    }, [problemId]);

    const loadTestCases = async () => {
        try {
            const response = await fetch(`/api/problems/${problemId}/testcases`);
            const data = await response.json();

            if (data.success) {
                setProblem(data.problem);
                setTestCases(data.testCases);
            } else {
                toast.error(data.error || 'Failed to load test cases');
            }
        } catch (error) {
            console.error('Error loading test cases:', error);
            toast.error('Failed to load test cases');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setLabel('');
        setInput('');
        setOutput('');
        setPoints(1);
        setIsSample(false);
        setEditingTestCase(null);
    };

    const handleAddTestCase = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const handleEditTestCase = (testCase: TestCase) => {
        setEditingTestCase(testCase);
        setLabel(testCase.label);
        setInput(testCase.input);
        setOutput(testCase.output);
        setPoints(testCase.points);
        setIsSample(testCase.isSample);
        setIsDialogOpen(true);
    };

    const handleDeleteTestCase = async (testCaseId: number) => {
        if (!confirm('Are you sure you want to delete this test case?')) {
            return;
        }

        try {
            const response = await fetch(`/api/problems/${problemId}/testcases/${testCaseId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Test case deleted successfully!');
                loadTestCases(); // Reload the list
            } else {
                toast.error(data.error || 'Failed to delete test case');
            }
        } catch (error) {
            console.error('Error deleting test case:', error);
            toast.error('Failed to delete test case');
        }
    };

    const handleSave = async () => {
        if (!label.trim()) {
            toast.error('Label is required');
            return;
        }

        if (!input.trim()) {
            toast.error('Input is required');
            return;
        }

        if (!output.trim()) {
            toast.error('Output is required');
            return;
        }

        if (points < 1 || points > 100) {
            toast.error('Points must be between 1 and 100');
            return;
        }

        setIsSaving(true);
        try {
            const url = editingTestCase
                ? `/api/problems/${problemId}/testcases/${editingTestCase.id}`
                : `/api/problems/${problemId}/testcases`;

            const method = editingTestCase ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    label: label.trim(),
                    input: input.trim(),
                    output: output.trim(),
                    points,
                    isSample,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(editingTestCase ? 'Test case updated successfully!' : 'Test case added successfully!');
                setIsDialogOpen(false);
                resetForm();
                loadTestCases(); // Reload the list
            } else {
                toast.error(data.error || 'Failed to save test case');
            }
        } catch (error) {
            console.error('Error saving test case:', error);
            toast.error('Failed to save test case');
        } finally {
            setIsSaving(false);
        }
    };

    const downloadFile = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading test cases...</div>
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Test Cases</h1>
                    <p className="text-muted-foreground">
                        Manage test cases for problem: {problem.title}
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddTestCase}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Test Case
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingTestCase ? 'Edit Test Case' : 'Add Test Case'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="label">Label</Label>
                                <Input
                                    id="label"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="e.g., Sample 1, Test Case 1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="points">Points</Label>
                                <Input
                                    id="points"
                                    type="number"
                                    value={points}
                                    onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                                    min={1}
                                    max={100}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isSample"
                                    checked={isSample}
                                    onCheckedChange={(checked) => setIsSample(checked as boolean)}
                                />
                                <Label htmlFor="isSample">Include in problem statement (Sample)</Label>
                            </div>

                            <div>
                                <Label htmlFor="input">Input</Label>
                                <Textarea
                                    id="input"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Enter test case input..."
                                    rows={6}
                                />
                            </div>

                            <div>
                                <Label htmlFor="output">Expected Output</Label>
                                <Textarea
                                    id="output"
                                    value={output}
                                    onChange={(e) => setOutput(e.target.value)}
                                    placeholder="Enter expected output..."
                                    rows={6}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : (editingTestCase ? 'Update' : 'Add')}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {testCases.length === 0 ? (
                <Card>
                    <CardContent className="flex items-center justify-center h-32">
                        <div className="text-center">
                            <p className="text-muted-foreground">No test cases found</p>
                            <p className="text-sm text-muted-foreground">Add your first test case to get started</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Test Cases ({testCases.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Label</TableHead>
                                    <TableHead>Points</TableHead>
                                    <TableHead>Sample</TableHead>
                                    <TableHead>Input</TableHead>
                                    <TableHead>Output</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {testCases.map((testCase, index) => (
                                    <TableRow key={testCase.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{testCase.label}</TableCell>
                                        <TableCell>{testCase.points}</TableCell>
                                        <TableCell>
                                            {testCase.isSample ? (
                                                <Badge variant="secondary">Sample</Badge>
                                            ) : (
                                                <Badge variant="outline">Hidden</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">
                                                    {testCase.input.length > 50
                                                        ? `${testCase.input.substring(0, 50)}...`
                                                        : testCase.input
                                                    }
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => downloadFile(testCase.input, `input-${testCase.label}.txt`)}
                                                >
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">
                                                    {testCase.output.length > 50
                                                        ? `${testCase.output.substring(0, 50)}...`
                                                        : testCase.output
                                                    }
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => downloadFile(testCase.output, `output-${testCase.label}.txt`)}
                                                >
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditTestCase(testCase)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteTestCase(testCase.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
