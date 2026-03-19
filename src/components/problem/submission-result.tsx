"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, Play, Zap, HardDrive } from "lucide-react"

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

interface SubmissionResultProps {
    submission: {
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
    };
    onViewCode: (code: string) => void;
}

export function SubmissionResult({ submission, onViewCode }: SubmissionResultProps) {
    const [expandedTestCases, setExpandedTestCases] = useState<number[]>([])

    const toggleTestCase = (id: number) => {
        setExpandedTestCases(prev =>
            prev.includes(id)
                ? prev.filter(testId => testId !== id)
                : [...prev, id]
        )
    }

    const getVerdictColor = (verdict: string) => {
        if (verdict.includes('Accepted') || verdict.includes('Passed')) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        if (verdict.includes('Wrong') || verdict.includes('Failed')) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        if (verdict.includes('Time') || verdict.includes('Memory')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }

    const getVerdictIcon = (verdict: string) => {
        if (verdict.includes('Accepted') || verdict.includes('Passed')) return <CheckCircle className="w-4 h-4" />
        if (verdict.includes('Wrong') || verdict.includes('Failed')) return <XCircle className="w-4 h-4" />
        if (verdict.includes('Time') || verdict.includes('Memory')) return <AlertTriangle className="w-4 h-4" />
        return <Clock className="w-4 h-4" />
    }

    const scorePercentage = submission.totalTestCases > 0 ? (submission.testCasesPassed / submission.totalTestCases) * 100 : 0

    return (
        <Card className="w-full border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b border-blue-200/60 dark:border-blue-800/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            {getVerdictIcon(submission.verdict)}
                            <Badge className={`px-3 py-1 text-sm font-medium ${getVerdictColor(submission.verdict)}`}>
                                {submission.verdict}
                            </Badge>
                        </div>
                        <Badge variant="outline" className="px-3 py-1 text-sm">
                            {submission.language.toUpperCase()}
                        </Badge>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewCode(submission.code)}
                        className="h-9 px-4 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border-blue-200/60 dark:border-blue-700/40"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Code
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                {/* Score and Progress */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Test Case Results</h3>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {submission.testCasesPassed}/{submission.totalTestCases}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Test Cases Passed</div>
                        </div>
                    </div>
                    <Progress value={scorePercentage} className="h-3 bg-gray-200 dark:bg-gray-700">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 rounded-full"
                            style={{ width: `${scorePercentage}%` }}
                        />
                    </Progress>
                </div>

                {/* Execution Details */}
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/50 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Execution Time</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{submission.executionTime}ms</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">CPU Time</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{submission.cpuTime}ms</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <HardDrive className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Memory Used</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{submission.memoryUsed}MB</div>
                    </div>
                </div>

                {/* Test Case Results */}
                <div className="space-y-3">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Individual Test Cases</h4>
                    {submission.testCaseResults.map((testCase) => (
                        <div
                            key={testCase.id}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden hover:shadow-md transition-shadow duration-200"
                        >
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                                onClick={() => toggleTestCase(testCase.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${testCase.status === 'passed' ? 'bg-green-500' :
                                            testCase.status === 'failed' ? 'bg-red-500' :
                                                testCase.status === 'running' ? 'bg-yellow-500' :
                                                    'bg-gray-400'
                                        }`} />
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        Test Case {testCase.label}
                                    </span>
                                    <Badge className={`px-2 py-1 text-xs ${testCase.status === 'passed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                            testCase.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                                testCase.status === 'running' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                        }`}>
                                        {testCase.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    {testCase.executionTime && (
                                        <span className="flex items-center gap-1">
                                            <Play className="w-3 h-3" />
                                            {testCase.executionTime}ms
                                        </span>
                                    )}
                                    {testCase.memoryUsage && (
                                        <span className="flex items-center gap-1">
                                            <HardDrive className="w-3 h-3" />
                                            {testCase.memoryUsage}MB
                                        </span>
                                    )}
                                </div>
                            </div>

                            {expandedTestCases.includes(testCase.id) && (
                                <div className="px-4 pb-4 space-y-3 border-t border-gray-200/60 dark:border-gray-700/60">
                                    <div className="grid grid-cols-2 gap-4 pt-3">
                                        <div>
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input</div>
                                            <pre className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm text-gray-900 dark:text-gray-100 border border-gray-200/60 dark:border-gray-700/60 overflow-x-auto">
                                                {testCase.input}
                                            </pre>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expected Output</div>
                                            <pre className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm text-gray-900 dark:text-gray-100 border border-gray-200/60 dark:border-gray-700/60 overflow-x-auto">
                                                {testCase.expectedOutput}
                                            </pre>
                                        </div>
                                    </div>
                                    {testCase.actualOutput && (
                                        <div>
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actual Output</div>
                                            <pre className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm text-gray-900 dark:text-gray-100 border border-gray-200/60 dark:border-gray-700/60 overflow-x-auto">
                                                {testCase.actualOutput}
                                            </pre>
                                        </div>
                                    )}
                                    {testCase.error && (
                                        <div>
                                            <div className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Error</div>
                                            <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm text-red-800 dark:text-red-200 border border-red-200/60 dark:border-red-800/40 overflow-x-auto">
                                                {testCase.error}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
