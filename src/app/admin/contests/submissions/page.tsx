"use client";

import { useState } from "react";
import { Eye, CheckCircle, XCircle, Clock, AlertCircle, Filter, Download, RefreshCw } from "lucide-react";

interface Submission {
    id: string;
    problemTitle: string;
    participant: string;
    language: string;
    verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Compilation Error' | 'Runtime Error' | 'Pending';
    score: number;
    cpuTime: number;
    memoryUsage: number;
    submittedAt: string;
    testCasesPassed: number;
    totalTestCases: number;
}

export default function ContestSubmissions() {
    const [submissions] = useState<Submission[]>([
        {
            id: "1",
            problemTitle: "Hello World",
            participant: "John Smith",
            language: "Python 3",
            verdict: 'Accepted',
            score: 100,
            cpuTime: 45,
            memoryUsage: 12,
            submittedAt: "2024-12-15T14:30:00Z",
            testCasesPassed: 5,
            totalTestCases: 5
        },
        {
            id: "2",
            problemTitle: "Hello World",
            participant: "John Smith",
            language: "Python 3",
            verdict: 'Wrong Answer',
            score: 0,
            cpuTime: 52,
            memoryUsage: 15,
            submittedAt: "2024-12-15T14:25:00Z",
            testCasesPassed: 2,
            totalTestCases: 5
        },
        {
            id: "3",
            problemTitle: "Array Sum",
            participant: "Jane Doe",
            language: "C++",
            verdict: 'Time Limit Exceeded',
            score: 0,
            cpuTime: 2000,
            memoryUsage: 256,
            submittedAt: "2024-12-15T14:20:00Z",
            testCasesPassed: 0,
            totalTestCases: 5
        }
    ]);

    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [filterVerdict, setFilterVerdict] = useState<string>('all');
    const [filterProblem, setFilterProblem] = useState<string>('all');
    const [filterParticipant, setFilterParticipant] = useState<string>('all');

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'Accepted': return 'bg-green-100 text-green-800';
            case 'Wrong Answer': return 'bg-red-100 text-red-800';
            case 'Time Limit Exceeded': return 'bg-yellow-100 text-yellow-800';
            case 'Memory Limit Exceeded': return 'bg-orange-100 text-orange-800';
            case 'Compilation Error': return 'bg-purple-100 text-purple-800';
            case 'Runtime Error': return 'bg-pink-100 text-pink-800';
            case 'Pending': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getVerdictIcon = (verdict: string) => {
        switch (verdict) {
            case 'Accepted': return <CheckCircle className="w-4 h-4" />;
            case 'Wrong Answer': return <XCircle className="w-4 h-4" />;
            case 'Time Limit Exceeded': return <Clock className="w-4 h-4" />;
            case 'Memory Limit Exceeded': return <AlertCircle className="w-4 h-4" />;
            case 'Compilation Error': return <XCircle className="w-4 h-4" />;
            case 'Runtime Error': return <AlertCircle className="w-4 h-4" />;
            case 'Pending': return <Clock className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const filteredSubmissions = submissions.filter(submission => {
        if (filterVerdict !== 'all' && submission.verdict !== filterVerdict) return false;
        if (filterProblem !== 'all' && submission.problemTitle !== filterProblem) return false;
        if (filterParticipant !== 'all' && submission.participant !== filterParticipant) return false;
        return true;
    });

    const uniqueProblems = [...new Set(submissions.map(s => s.problemTitle))];
    const uniqueParticipants = [...new Set(submissions.map(s => s.participant))];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Submissions</h1>
                    <p className="text-muted-foreground">
                        Review and manage contest submissions
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border rounded-md hover:bg-muted flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="px-4 py-2 border rounded-md hover:bg-muted flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold">{submissions.length}</span>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Submissions</p>
                            <p className="text-lg font-semibold">All Time</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 font-bold">
                                {submissions.filter(s => s.verdict === 'Accepted').length}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Accepted</p>
                            <p className="text-lg font-semibold">Solutions</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-yellow-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span className="text-yellow-600 font-bold">
                                {submissions.filter(s => s.verdict === 'Pending').length}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-lg font-semibold">Reviews</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-purple-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-purple-600 font-bold">
                                {uniqueParticipants.length}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Active</p>
                            <p className="text-lg font-semibold">Participants</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3 mb-4">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Verdict</label>
                        <select
                            value={filterVerdict}
                            onChange={(e) => setFilterVerdict(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="all">All Verdicts</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Wrong Answer">Wrong Answer</option>
                            <option value="Time Limit Exceeded">Time Limit Exceeded</option>
                            <option value="Memory Limit Exceeded">Memory Limit Exceeded</option>
                            <option value="Compilation Error">Compilation Error</option>
                            <option value="Runtime Error">Runtime Error</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Problem</label>
                        <select
                            value={filterProblem}
                            onChange={(e) => setFilterProblem(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="all">All Problems</option>
                            {uniqueProblems.map(problem => (
                                <option key={problem} value={problem}>{problem}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Participant</label>
                        <select
                            value={filterParticipant}
                            onChange={(e) => setFilterParticipant(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="all">All Participants</option>
                            {uniqueParticipants.map(participant => (
                                <option key={participant} value={participant}>{participant}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Submissions List */}
            <div className="border rounded-lg">
                <div className="p-4 border-b bg-muted/50">
                    <h3 className="font-semibold">Recent Submissions ({filteredSubmissions.length})</h3>
                </div>
                <div className="divide-y">
                    {filteredSubmissions.map((submission) => (
                        <div key={submission.id} className="p-4 hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-medium">{submission.problemTitle}</h4>
                                        <span className="text-sm text-muted-foreground">by {submission.participant}</span>
                                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getVerdictColor(submission.verdict)}`}>
                                            {getVerdictIcon(submission.verdict)}
                                            {submission.verdict}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-muted-foreground">
                                        <div>
                                            <span className="font-medium">Language:</span> {submission.language}
                                        </div>
                                        <div>
                                            <span className="font-medium">Score:</span> {submission.score}
                                        </div>
                                        <div>
                                            <span className="font-medium">Time:</span> {submission.cpuTime}ms
                                        </div>
                                        <div>
                                            <span className="font-medium">Memory:</span> {submission.memoryUsage}MB
                                        </div>
                                        <div>
                                            <span className="font-medium">Tests:</span> {submission.testCasesPassed}/{submission.totalTestCases}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => setSelectedSubmission(submission)}
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
