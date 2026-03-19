"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Plus, Play, Eye, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface Solution {
    id: number;
    label: string;
    note: string;
    language: string;
    sourceCode: string;
    verdict: string;
    cpuTime: number;
    memoryUsage: number;
    createdAt: string;
}

interface Problem {
    id: number;
    title: string;
    timeLimit: number;
    memoryLimit: number;
}

interface TestCase {
    id: number;
    label: string;
    input: string;
    output: string;
    isSample: boolean;
}

interface TestCaseResult {
    testCaseId: number;
    testCaseLabel: string;
    verdict: string;
    cpuTime: number;
    memoryUsage: number;
    error?: string;
    status: 'pending' | 'running' | 'completed' | 'error';
}

interface ExecutionResults {
    overallVerdict: string;
    passedTests: number;
    totalTests: number;
    maxTime: number;
    maxMemory: number;
    testCaseResults: TestCaseResult[];
}

const LANGUAGE_OPTIONS = [
    { value: 'cpp', label: 'C++ (GCC 9.2.0)' },
    { value: 'c', label: 'C (GCC 9.2.0)' },
    { value: 'java', label: 'Java (OpenJDK 13.0.1)' },
    { value: 'python', label: 'Python (3.8.1)' },
    { value: 'javascript', label: 'JavaScript (Node.js 12.14.0)' },
    { value: 'csharp', label: 'C# (Mono 6.6.0.161)' },
    { value: 'go', label: 'Go (1.13.5)' },
    { value: 'rust', label: 'Rust (1.40.0)' },
];

const LANGUAGE_IDS: Record<string, number> = {
    python: 71, // Python (3.8.1)
    javascript: 63, // JavaScript (Node.js 12.14.0)
    java: 62, // Java (OpenJDK 13.0.1)
    cpp: 54, // C++ (GCC 9.2.0)
    c: 50, // C (GCC 9.2.0)
    csharp: 51, // C# (Mono 6.6.0.161)
    ruby: 72, // Ruby (2.7.0)
    go: 60, // Go (1.13.5)
    rust: 73, // Rust (1.40.0)
};

// Monaco editor language mapping
const MONACO_LANGUAGE_MAP: Record<string, string> = {
    cpp: 'cpp',
    c: 'c',
    java: 'java',
    python: 'python',
    javascript: 'javascript',
    csharp: 'csharp',
    go: 'go',
    rust: 'rust',
};

const JUDGE0_API_ENDPOINT = process.env.NEXT_PUBLIC_JUDGE0_API_ENDPOINT || 'http://localhost:2358';

export default function SolutionsPage() {
    const params = useParams();
    const problemId = params.problemId as string;
    const { theme } = useTheme();

    const [problem, setProblem] = useState<Problem | null>(null);
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isRunning, setIsRunning] = useState<number | null>(null);

    // Execution state
    const [executionResults, setExecutionResults] = useState<ExecutionResults | null>(null);
    const [showExecutionModal, setShowExecutionModal] = useState(false);
    const [executionProgress, setExecutionProgress] = useState(0);

    // Form state
    const [label, setLabel] = useState('');
    const [note, setNote] = useState('');
    const [language, setLanguage] = useState('');
    const [sourceCode, setSourceCode] = useState('');

    useEffect(() => {
        loadData();
    }, [problemId]);

    const loadData = async () => {
        try {
            const [solutionsResponse, testCasesResponse] = await Promise.all([
                fetch(`/api/problems/${problemId}/solutions`),
                fetch(`/api/problems/${problemId}/testcases`)
            ]);

            const solutionsData = await solutionsResponse.json();
            const testCasesData = await testCasesResponse.json();

            if (solutionsData.success) {
                setProblem(solutionsData.problem);
                setSolutions(solutionsData.solutions);
            } else {
                toast.error(solutionsData.error || 'Failed to load solutions');
            }

            if (testCasesData.success) {
                setTestCases(testCasesData.testCases);
            } else {
                toast.error(testCasesData.error || 'Failed to load test cases');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setLabel('');
        setNote('');
        setLanguage('');
        setSourceCode('');
        setEditingSolution(null);
    };

    const handleAddSolution = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const handleEditSolution = (solution: Solution) => {
        setEditingSolution(solution);
        setLabel(solution.label);
        setNote(solution.note);
        setLanguage(solution.language);
        setSourceCode(solution.sourceCode);
        setIsDialogOpen(true);
    };

    const handleDeleteSolution = async (solutionId: number) => {
        if (!confirm('Are you sure you want to delete this solution?')) {
            return;
        }

        try {
            const response = await fetch(`/api/problems/${problemId}/solutions/${solutionId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Solution deleted successfully!');
                loadData();
            } else {
                toast.error(data.error || 'Failed to delete solution');
            }
        } catch (error) {
            console.error('Error deleting solution:', error);
            toast.error('Failed to delete solution');
        }
    };

    const handleSave = async () => {
        if (!label.trim()) {
            toast.error('Label is required');
            return;
        }

        if (!language) {
            toast.error('Language is required');
            return;
        }

        if (!sourceCode.trim()) {
            toast.error('Source code is required');
            return;
        }

        setIsSaving(true);
        try {
            const url = editingSolution
                ? `/api/problems/${problemId}/solutions/${editingSolution.id}`
                : `/api/problems/${problemId}/solutions`;

            const method = editingSolution ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    label: label.trim(),
                    note: note.trim(),
                    language,
                    sourceCode: sourceCode.trim(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(editingSolution ? 'Solution updated successfully!' : 'Solution added successfully!');
                setIsDialogOpen(false);
                resetForm();
                loadData();
            } else {
                toast.error(data.error || 'Failed to save solution');
            }
        } catch (error) {
            console.error('Error saving solution:', error);
            toast.error('Failed to save solution');
        } finally {
            setIsSaving(false);
        }
    };

    const runSolution = async (solution: Solution) => {
        if (!problem) return;

        setIsRunning(solution.id);
        setShowExecutionModal(true);
        setExecutionProgress(0);
        setExecutionResults(null);

        try {
            const response = await fetch(`/api/problems/${problemId}/solutions/${solution.id}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                setExecutionResults(data.results);
                toast.success(data.message);
                loadData(); // Refresh solutions to get updated verdict
            } else {
                toast.error(data.error || 'Failed to execute solution');
            }
        } catch (error) {
            console.error('Error executing solution:', error);
            toast.error('Failed to execute solution');
        } finally {
            setIsRunning(null);
        }
    };



    const getVerdictIcon = (verdict: string) => {
        switch (verdict) {
            case 'AC':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'WA':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'TLE':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'MLE':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'CE':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'RE':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'AC':
                return 'bg-green-100 text-green-800';
            case 'WA':
                return 'bg-red-100 text-red-800';
            case 'TLE':
                return 'bg-yellow-100 text-yellow-800';
            case 'MLE':
                return 'bg-orange-100 text-orange-800';
            case 'CE':
                return 'bg-red-100 text-red-800';
            case 'RE':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <div className="h-4 w-4 rounded-full bg-gray-300" />;
            case 'running':
                return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <div className="h-4 w-4 rounded-full bg-gray-300" />;
        }
    };

    if (isLoading) {
        return (
            <div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading solutions...</div>
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
                    <h1 className="text-3xl font-bold mb-2">Solutions</h1>
                    <p className="text-muted-foreground">
                        Manage solutions for problem: {problem.title}
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddSolution}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Solution
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingSolution ? 'Edit Solution' : 'Add Solution'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="label">Label</Label>
                                    <Input
                                        id="label"
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                        placeholder="e.g., Optimal Solution, Brute Force"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="language">Language</Label>
                                    <Select value={language} onValueChange={setLanguage}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LANGUAGE_OPTIONS.map((lang) => (
                                                <SelectItem key={lang.value} value={lang.value}>
                                                    {lang.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="note">Note</Label>
                                <Textarea
                                    id="note"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Optional notes about this solution..."
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label htmlFor="sourceCode">
                                    Source Code
                                    {language && (
                                        <span className="ml-2 text-sm text-muted-foreground">
                                            ({LANGUAGE_OPTIONS.find(l => l.value === language)?.label})
                                        </span>
                                    )}
                                </Label>
                                <div className="border rounded-md overflow-hidden">
                                    <Editor
                                        height="350px"
                                        language={MONACO_LANGUAGE_MAP[language] || 'plaintext'}
                                        value={sourceCode || ''}
                                        onChange={(value) => setSourceCode(value || '')}
                                        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                                        loading={<div className="flex items-center justify-center h-[400px] text-muted-foreground">Loading editor...</div>}
                                        options={{
                                            minimap: { enabled: false },
                                            scrollBeyondLastLine: false,
                                            fontSize: 14,
                                            lineNumbers: 'on',
                                            roundedSelection: false,
                                            scrollbar: {
                                                vertical: 'visible',
                                                horizontal: 'visible',
                                            },
                                            automaticLayout: true,

                                            wordWrap: 'on',
                                            folding: true,
                                            showFoldingControls: 'always',
                                            suggestOnTriggerCharacters: true,
                                            quickSuggestions: true,
                                            parameterHints: { enabled: true },
                                            hover: { enabled: true },
                                            contextmenu: true,
                                            copyWithSyntaxHighlighting: true,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : (editingSolution ? 'Update' : 'Add')}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {solutions.length === 0 ? (
                <Card>
                    <CardContent className="flex items-center justify-center h-32">
                        <div className="text-center">
                            <p className="text-muted-foreground">No solutions found</p>
                            <p className="text-sm text-muted-foreground">Add your first solution to get started</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Solutions ({solutions.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Label</TableHead>
                                    <TableHead>Language</TableHead>
                                    <TableHead>Verdict</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Memory</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {solutions.map((solution) => (
                                    <TableRow key={solution.id}>
                                        <TableCell className="font-medium">{solution.label}</TableCell>
                                        <TableCell>
                                            {LANGUAGE_OPTIONS.find(l => l.value === solution.language)?.label || solution.language}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getVerdictIcon(solution.verdict)}
                                                <Badge className={getVerdictColor(solution.verdict)}>
                                                    {solution.verdict}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {solution.cpuTime > 0 ? `${solution.cpuTime}ms` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {solution.memoryUsage > 0 ? `${solution.memoryUsage}KB` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => runSolution(solution)}
                                                    disabled={isRunning === solution.id}
                                                >
                                                    <Play className="h-3 w-3" />
                                                    {isRunning === solution.id ? 'Running...' : 'Run'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditSolution(solution)}
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteSolution(solution.id)}
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

            {/* Execution Results Modal */}
            <Dialog open={showExecutionModal} onOpenChange={setShowExecutionModal}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {isRunning ? 'Executing Solution...' : 'Execution Results'}
                        </DialogTitle>
                    </DialogHeader>

                    {isRunning && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Running solution against {testCases.length} test cases...</span>
                            </div>
                            <Progress value={executionProgress} className="w-full" />
                        </div>
                    )}

                    {executionResults && (
                        <div className="space-y-6">
                            {/* Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {getVerdictIcon(executionResults.overallVerdict)}
                                        Execution Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {executionResults.passedTests}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Passed</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {executionResults.totalTests - executionResults.passedTests}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Failed</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">
                                                {executionResults.maxTime}ms
                                            </div>
                                            <div className="text-sm text-muted-foreground">Max Time</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">
                                                {executionResults.maxMemory}KB
                                            </div>
                                            <div className="text-sm text-muted-foreground">Max Memory</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Test Case Results */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Test Case Results</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Test Case</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Verdict</TableHead>
                                                <TableHead>Time</TableHead>
                                                <TableHead>Memory</TableHead>
                                                <TableHead>Error</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {executionResults.testCaseResults.map((result) => (
                                                <TableRow key={result.testCaseId}>
                                                    <TableCell className="font-medium">
                                                        {result.testCaseLabel}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(result.status)}
                                                            <span className="capitalize">{result.status}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getVerdictIcon(result.verdict)}
                                                            <Badge className={getVerdictColor(result.verdict)}>
                                                                {result.verdict}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {result.cpuTime > 0 ? `${result.cpuTime}ms` : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {result.memoryUsage > 0 ? `${result.memoryUsage}KB` : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {result.error ? (
                                                            <div className="max-w-xs">
                                                                <div className="text-xs text-red-600 font-mono bg-red-50 p-2 rounded">
                                                                    {result.error}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
