"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Calendar, CheckCircle, Clock, Eye, Filter, HardDrive, OctagonAlert, Play, Search, SortAsc, SortDesc, XCircle } from "lucide-react"
import { useState } from 'react'

interface TestCaseResult {
    id: number;
    label: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    executionTime?: number;
    memoryUsage?: number;
    error?: string;
}

interface SubmissionHistoryProps {
    submissions: Array<{
        id: string;
        timestamp: Date;
        language: string;
        code: string;
        verdict: string;
        testCasesPassed: number;
        totalTestCases: number;
        score: number;
        totalScore: number;
        cpuTime: number;
        memoryUsage: number;
        executionTime: number;
        memoryUsed: number;
        testCaseResults: TestCaseResult[];
    }>;
    onViewCode: (code: string) => void;
    onViewSubmission: (submission: any) => void;
}

export function SubmissionHistory({ submissions, onViewCode, onViewSubmission }: SubmissionHistoryProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [languageFilter, setLanguageFilter] = useState('all')
    const [sortBy, setSortBy] = useState<'timestamp' | 'verdict' | 'score'>('timestamp')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const getVerdictIcon = (verdict: string) => {
        if (verdict.includes('Accepted') || verdict.includes('Passed')) return <CheckCircle className="w-4 h-4 text-green-500" />
        if (verdict.includes('Wrong') || verdict.includes('Failed')) return <XCircle className="w-4 h-4 text-red-500" />
        if (verdict.includes('Time') || verdict.includes('Memory')) return <AlertTriangle className="w-4 h-4 text-yellow-500" />
        return <OctagonAlert className="w-4 h-4 text-gray-500" />
    }

    const getVerdictColor = (verdict: string) => {
        if (verdict.includes('Accepted') || verdict.includes('Passed')) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        if (verdict.includes('Wrong') || verdict.includes('Failed')) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        if (verdict.includes('Time') || verdict.includes('Memory')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }

    const formatTimestamp = (timestamp: Date) => {
        if (!timestamp || isNaN(timestamp.getTime())) {
            return 'Invalid date'
        }

        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(timestamp)
    }

    const getLanguageDisplayName = (lang: string) => {
        const languageMap: Record<string, string> = {
            'cpp': 'C++',
            'java': 'Java',
            'python': 'Python 3',
            'javascript': 'JavaScript'
        }
        return languageMap[lang] || lang
    }

    const filteredSubmissions = submissions
        .filter(submission => {
            const matchesSearch = submission.verdict.toLowerCase().includes(searchTerm.toLowerCase()) ||
                submission.language.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'accepted' && submission.verdict.includes('Accepted')) ||
                (statusFilter === 'failed' && !submission.verdict.includes('Accepted'))
            const matchesLanguage = languageFilter === 'all' || submission.language === languageFilter

            return matchesSearch && matchesStatus && matchesLanguage
        })
        .sort((a, b) => {
            let aValue: any, bValue: any

            switch (sortBy) {
                case 'timestamp':
                    aValue = a.timestamp.getTime()
                    bValue = b.timestamp.getTime()
                    break
                case 'verdict':
                    aValue = a.verdict
                    bValue = b.verdict
                    break
                case 'score':
                    aValue = a.testCasesPassed / a.totalTestCases
                    bValue = b.testCasesPassed / b.totalTestCases
                    break
                default:
                    return 0
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

    const toggleSort = (field: 'timestamp' | 'verdict' | 'score') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
    }

    if (submissions.length === 0) {
        return (
            <Card className="w-full border-0 shadow-lg">
                <CardContent className="p-6 md:p-8 text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Submissions Yet</h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Submit your first solution to see it here</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full border-0 shadow-xl">
            <CardHeader className="pb-4 border-b">
                {/* Filters and Search */}
                <div className="flex flex-col gap-3 md:gap-4 mt-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search submissions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white/80 dark:bg-gray-800/80 border-blue-200/60 dark:border-blue-700/40 text-sm md:text-base"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-32 bg-white/80 dark:bg-gray-800/80 border-blue-200/60 dark:border-blue-700/40 h-9 md:h-10">
                                <Filter className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={languageFilter} onValueChange={setLanguageFilter}>
                            <SelectTrigger className="w-full sm:w-32 bg-white/80 dark:bg-gray-800/80 border-blue-200/60 dark:border-blue-700/40 h-9 md:h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Languages</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Sort Controls */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSort('timestamp')}
                        className={`h-6 md:h-7 px-2 text-xs ${sortBy === 'timestamp' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Calendar className="w-3 h-3 mr-1" />
                        Time
                        {sortBy === 'timestamp' && (sortOrder === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />)}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSort('verdict')}
                        className={`h-6 md:h-7 px-2 text-xs ${sortBy === 'verdict' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        Status
                        {sortBy === 'verdict' && (sortOrder === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />)}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSort('score')}
                        className={`h-6 md:h-7 px-2 text-xs ${sortBy === 'score' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        Score
                        {sortBy === 'score' && (sortOrder === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />)}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="space-y-3 p-3 md:p-4">
                    {filteredSubmissions.map((submission) => (
                        <div
                            key={submission.id}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200/60 dark:border-gray-700/60 p-3 md:p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                            onClick={() => onViewSubmission(submission)}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                                    <div className="flex flex-col gap-2 md:gap-3">
                                        <div className="flex items-center gap-2">
                                            {getVerdictIcon(submission.verdict)}
                                            <Badge className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium ${getVerdictColor(submission.verdict)}`}>
                                                {submission.verdict}
                                            </Badge>
                                        </div>
                                        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                            {formatTimestamp(submission.timestamp)}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                        <Badge variant="outline" className="px-2 py-1 text-xs">
                                            {getLanguageDisplayName(submission.language)}
                                        </Badge>
                                        <span className="flex items-center gap-1">
                                            <Play className="w-3 h-3" />
                                            {submission.executionTime}ms
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <HardDrive className="w-3 h-3" />
                                            {submission.memoryUsed}MB
                                        </span>
                                    </div>
                                </div>

                                <div className="text-center sm:text-right">
                                    <div className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {submission.testCasesPassed}/{submission.totalTestCases}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Test Cases</div>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                                        Click to view full details
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onViewCode(submission.code)
                                        }}
                                        className="h-7 px-3 text-xs bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border-blue-200/60 dark:border-blue-700/40 w-full sm:w-auto"
                                    >
                                        <Eye className="w-3 h-3 mr-1" />
                                        View Code
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredSubmissions.length === 0 && (
                    <div className="p-6 md:p-8 text-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <Search className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                        </div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Results Found</h3>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
