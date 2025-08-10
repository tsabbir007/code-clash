'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Submission {
    id: number;
    when: string;
    author: string;
    type: string;
    language: string;
    cpuTime: number;
    memoryUsage: number;
    verdict: string;
    sourceCode: string;
}

const VERDICT_COLORS: Record<string, string> = {
    'AC': 'bg-green-100 text-green-800',
    'WA': 'bg-red-100 text-red-800',
    'TLE': 'bg-yellow-100 text-yellow-800',
    'MLE': 'bg-orange-100 text-orange-800',
    'CE': 'bg-purple-100 text-purple-800',
    'RE': 'bg-gray-100 text-gray-800',
};

const LANGUAGE_NAMES: Record<string, string> = {
    'cpp': 'C++',
    'c': 'C',
    'java': 'Java',
    'python': 'Python',
    'javascript': 'JavaScript',
    'csharp': 'C#',
    'ruby': 'Ruby',
    'go': 'Go',
    'rust': 'Rust',
};

export default function SubmissionsPage() {
    const params = useParams();
    const problemId = params.problem_id as string;

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        handle: '',
        language: '',
        verdict: '',
    });

    useEffect(() => {
        fetchSubmissions();
    }, [problemId, filters]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.handle) queryParams.append('handle', filters.handle);
            if (filters.language) queryParams.append('language', filters.language);
            if (filters.verdict) queryParams.append('verdict', filters.verdict);

            const response = await fetch(`/api/problems/${problemId}/submissions?${queryParams}`);
            const data = await response.json();

            if (data.success) {
                setSubmissions(data.submissions);
            } else {
                toast.error(data.error || 'Failed to fetch submissions');
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            toast.error('Failed to fetch submissions');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatTime = (timeMs: number) => {
        if (!timeMs) return '-';
        return `${timeMs}ms`;
    };

    const formatMemory = (memoryKB: number) => {
        if (!memoryKB) return '-';
        return `${memoryKB}KB`;
    };

    const clearFilters = () => {
        setFilters({
            handle: '',
            language: '',
            verdict: '',
        });
    };

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="mb-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Handle</label>
                                <Input
                                    placeholder="Filter by handle..."
                                    value={filters.handle}
                                    onChange={(e) => setFilters(prev => ({ ...prev, handle: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Language</label>
                                <Select value={filters.language || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, language: value === "all" ? "" : value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All languages" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All languages</SelectItem>
                                        {Object.entries(LANGUAGE_NAMES).map(([key, name]) => (
                                            <SelectItem key={key} value={key}>{name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Verdict</label>
                                <Select value={filters.verdict || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, verdict: value === "all" ? "" : value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All verdicts" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All verdicts</SelectItem>
                                        {Object.keys(VERDICT_COLORS).map((verdict) => (
                                            <SelectItem key={verdict} value={verdict}>{verdict}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={clearFilters} variant="outline" className="w-full">
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Submissions Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Id</TableHead>
                                    <TableHead>When</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Language</TableHead>
                                    <TableHead>CPU</TableHead>
                                    <TableHead>Memory</TableHead>
                                    <TableHead>Verdict</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            Loading submissions...
                                        </TableCell>
                                    </TableRow>
                                ) : submissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No submissions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    submissions.map((submission) => (
                                        <TableRow key={submission.id}>
                                            <TableCell className="font-mono">{submission.id}</TableCell>
                                            <TableCell>{formatDate(submission.when)}</TableCell>
                                            <TableCell>{submission.author || 'Unknown'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{submission.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {LANGUAGE_NAMES[submission.language] || submission.language}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono">{formatTime(submission.cpuTime)}</TableCell>
                                            <TableCell className="font-mono">{formatMemory(submission.memoryUsage)}</TableCell>
                                            <TableCell>
                                                <Badge className={VERDICT_COLORS[submission.verdict] || 'bg-gray-100 text-gray-800'}>
                                                    {submission.verdict || '-'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Summary */}
                    {!loading && submissions.length > 0 && (
                        <div className="mt-4 text-sm text-muted-foreground">
                            Showing {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
