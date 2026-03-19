"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, HardDrive, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface ProblemStatementProps {
    title: string
    statement: string
    difficulty: string
    timeLimit: number
    memoryLimit: number
    categories: Array<{
        id: number
        name: string
        color: string
    }>
    testCases: Array<{
        id: number
        label: string
        input: string
        output: string
        points: number
        isSample: boolean
    }>
}

export function ProblemStatement({
    title,
    statement,
    difficulty,
    timeLimit,
    memoryLimit,
    categories,
    testCases
}: ProblemStatementProps) {
    const sampleTestCases = testCases.filter(tc => tc.isSample)
    const hiddenTestCases = testCases.filter(tc => !tc.isSample)

    const getDifficultyColor = (diff: string) => {
        switch (diff.toLowerCase()) {
            case 'easy':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            case 'hard':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }
    }

    return (
        <div className="h-full overflow-y-auto p-6 space-y-6">
            {/* Problem Header */}
            {/* <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge className={`px-3 py-1 text-sm font-medium capitalize ${getDifficultyColor(difficulty)}`}>
                        {difficulty}
                    </Badge>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <Clock className="w-4 h-4" />
                            {timeLimit}ms
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <HardDrive className="w-4 h-4" />
                            {memoryLimit}MB
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <span
                            key={category.id}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-lg border border-blue-200/60 dark:border-blue-700/40"
                        >
                            {category.name}
                        </span>
                    ))}
                </div>
            </div> */}

            {/* Problem Statement */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
                <div
                    className="text-gray-900 dark:text-gray-100 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: statement }}
                />
            </div>

            {/* Test Cases */}
            <Tabs defaultValue="examples" className="w-full">
                <TabsList className="grid w-full grid-cols-1 bg-gray-100 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60">
                    <TabsTrigger value="examples" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">
                        Examples
                    </TabsTrigger>
                    {/* <TabsTrigger value="constraints" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">
                        Constraints
                    </TabsTrigger> */}
                </TabsList>

                <TabsContent value="examples" className="mt-4">
                    <div className="space-y-4">
                        {sampleTestCases.map((testCase, index) => (
                            <Card key={testCase.id} className="border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                        Example {index + 1}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input</div>
                                            <pre className="bg-white dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-900 dark:text-gray-100 border border-gray-200/60 dark:border-gray-700/60 overflow-x-auto whitespace-pre-wrap font-mono">
                                                {testCase.input}
                                            </pre>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output</div>
                                            <pre className="bg-white dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-900 dark:text-gray-100 border border-gray-200/60 dark:border-gray-700/60 overflow-x-auto whitespace-pre-wrap font-mono">
                                                {testCase.output}
                                            </pre>
                                        </div>
                                    </div>
                                    {testCase.points > 0 && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">Points:</span> {testCase.points}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {hiddenTestCases.length > 0 && (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {hiddenTestCases.length} hidden test case{hiddenTestCases.length !== 1 ? 's' : ''} will be used to evaluate your solution
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* <TabsContent value="constraints" className="mt-4">
                    <Card className="border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/50">
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">Time Complexity</span>
                                    <span className="text-gray-600 dark:text-gray-400">O(n) or better</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">Space Complexity</span>
                                    <span className="text-gray-600 dark:text-gray-400">O(n) or better</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">Input Constraints</span>
                                    <span className="text-gray-600 dark:text-gray-400">1 ≤ n ≤ 10^5</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">Memory Limit</span>
                                    <span className="text-gray-600 dark:text-gray-400">{memoryLimit}MB</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent> */}
            </Tabs>
        </div>
    )
}
