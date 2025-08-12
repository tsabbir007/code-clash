"use client";

import { useState, useEffect } from "react";
import { FileText, Clock, Code, CheckCircle, XCircle, AlertCircle, Filter, Search, Eye, Download, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Submission {
    id: number;
    problemId: number;
    problemTitle: string;
    userId: string;
    userName: string;
    language: string;
    verdict: string;
    score: number;
    cpuTime: number;
    memoryUsage: number;
    testCasesPassed: number;
    totalTestCases: number;
    submissionTime: string;
}

export default function ContestSubmissions({ params }: { params: { id: string } }) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVerdict, setSelectedVerdict] = useState<string>('all');

    const contestId = parseInt(params.id);

    useEffect(() => {
        fetchSubmissions();
    }, [contestId]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            // Mock data for now
            const mockSubmissions: Submission[] = [
                {
                    id: 1,
                    problemId: 1,
                    problemTitle: "Two Sum",
                    userId: "user1",
                    userName: "Alice Johnson",
                    language: "Python",
                    verdict: "Accepted",
                    score: 100,
                    cpuTime: 15,
                    memoryUsage: 14,
                    testCasesPassed: 10,
                    totalTestCases: 10,
                    submissionTime: "2024-12-15T10:15:00Z"
                },
                {
                    id: 2,
                    problemId: 1,
                    problemTitle: "Two Sum",
                    userId: "user2",
                    userName: "Bob Smith",
                    language: "Java",
                    verdict: "Wrong Answer",
                    score: 0,
                    cpuTime: 12,
                    memoryUsage: 16,
                    testCasesPassed: 3,
                    totalTestCases: 10,
                    submissionTime: "2024-12-15T10:20:00Z"
                }
            ];
            setSubmissions(mockSubmissions);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict.toLowerCase()) {
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'wrong answer':
                return 'bg-red-100 text-red-800';
            case 'time limit exceeded':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getVerdictIcon = (verdict: string) => {
        switch (verdict.toLowerCase()) {
            case 'accepted':
                return <CheckCircle className="w-4 h-4" />;
            default:
                return <XCircle className="w-4 h-4" />;
        }
    };

    const filteredSubmissions = submissions.filter(submission => {
        const matchesSearch =
            submission.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            submission.problemTitle.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesVerdict = selectedVerdict === 'all' || submission.verdict.toLowerCase() === selectedVerdict.toLowerCase();
        return matchesSearch && matchesVerdict;
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading submissions...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FileText className="w-8 h-8 text-blue-500" />
                        Contest Submissions
                    </h1>
                    <p className="text-muted-foreground">Review all contest submissions</p>
                </div>
                <Button onClick={fetchSubmissions} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

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
                                placeholder="Search submissions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedVerdict} onValueChange={setSelectedVerdict}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Verdicts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Verdicts</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="wrong answer">Wrong Answer</SelectItem>
                                <SelectItem value="time limit exceeded">Time Limit Exceeded</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Submissions ({filteredSubmissions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 font-medium">ID</th>
                                    <th className="text-left p-3 font-medium">Problem</th>
                                    <th className="text-left p-3 font-medium">Participant</th>
                                    <th className="text-left p-3 font-medium">Language</th>
                                    <th className="text-center p-3 font-medium">Verdict</th>
                                    <th className="text-center p-3 font-medium">Score</th>
                                    <th className="text-center p-3 font-medium">Time</th>
                                    <th className="text-center p-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubmissions.map((submission) => (
                                    <tr key={submission.id} className="border-b hover:bg-muted/50">
                                        <td className="p-3 font-mono text-sm">#{submission.id}</td>
                                        <td className="p-3">
                                            <div className="font-medium">{submission.problemTitle}</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-medium">{submission.userName}</div>
                                        </td>
                                        <td className="p-3">
                                            <Badge variant="outline">{submission.language}</Badge>
                                        </td>
                                        <td className="p-3 text-center">
                                            <Badge className={`${getVerdictColor(submission.verdict)} flex items-center gap-1 w-fit mx-auto`}>
                                                {getVerdictIcon(submission.verdict)}
                                                {submission.verdict}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-center font-medium">
                                            {submission.score > 0 ? (
                                                <span className="text-green-600">+{submission.score}</span>
                                            ) : (
                                                <span className="text-red-600">0</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center text-sm">
                                            {submission.cpuTime}ms
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <Button variant="outline" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
