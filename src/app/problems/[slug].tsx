"use client"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, CheckCircle, XCircle, Clock } from "lucide-react"
import Editor from "@monaco-editor/react"
import { useState } from "react"

const languages = [
    { value: "typescript", label: "TypeScript" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
]

const defaultCodeSnippets = {
    typescript: `function twoSum(nums: number[], target: number): number[] {
    // Your code here
    return [];
}

// Test cases
console.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]
console.log(twoSum([3, 2, 4], 6)); // Expected: [1, 2]
console.log(twoSum([3, 3], 6)); // Expected: [0, 1]`,

    javascript: `function twoSum(nums, target) {
    // Your code here
    return [];
}

// Test cases
console.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]
console.log(twoSum([3, 2, 4], 6)); // Expected: [1, 2]
console.log(twoSum([3, 3], 6)); // Expected: [0, 1]`,

    python: `def two_sum(nums, target):
    # Your code here
    return []

# Test cases
print(two_sum([2, 7, 11, 15], 9))  # Expected: [0, 1]
print(two_sum([3, 2, 4], 6))       # Expected: [1, 2]
print(two_sum([3, 3], 6))          # Expected: [0, 1]`,

    java: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        // Test cases
        System.out.println(Arrays.toString(solution.twoSum(new int[]{2, 7, 11, 15}, 9))); // Expected: [0, 1]
        System.out.println(Arrays.toString(solution.twoSum(new int[]{3, 2, 4}, 6)));       // Expected: [1, 2]
        System.out.println(Arrays.toString(solution.twoSum(new int[]{3, 3}, 6)));          // Expected: [0, 1]
    }
}`,

    cpp: `#include <vector>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};

int main() {
    Solution solution;
    // Test cases
    vector<int> result1 = solution.twoSum({2, 7, 11, 15}, 9);
    vector<int> result2 = solution.twoSum({3, 2, 4}, 6);
    vector<int> result3 = solution.twoSum({3, 3}, 6);
    return 0;
}`,

    csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
    
    public static void Main() {
        var solution = new Solution();
        // Test cases
        Console.WriteLine(string.Join(",", solution.TwoSum(new int[]{2, 7, 11, 15}, 9))); // Expected: 0,1
        Console.WriteLine(string.Join(",", solution.TwoSum(new int[]{3, 2, 4}, 6)));       // Expected: 1,2
        Console.WriteLine(string.Join(",", solution.TwoSum(new int[]{3, 3}, 6)));          // Expected: 0,1
    }
}`,

    go: `package main

import "fmt"

func twoSum(nums []int, target int) []int {
    // Your code here
    return []int{}
}

func main() {
    // Test cases
    fmt.Println(twoSum([]int{2, 7, 11, 15}, 9)) // Expected: [0 1]
    fmt.Println(twoSum([]int{3, 2, 4}, 6))       // Expected: [1 2]
    fmt.Println(twoSum([]int{3, 3}, 6))          // Expected: [0 1]
}`,

    rust: `fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    // Your code here
    vec![]
}

fn main() {
    // Test cases
    println!("{:?}", two_sum(vec![2, 7, 11, 15], 9)); // Expected: [0, 1]
    println!("{:?}", two_sum(vec![3, 2, 4], 6));       // Expected: [1, 2]
    println!("{:?}", two_sum(vec![3, 3], 6));          // Expected: [0, 1]
}`,

    php: `<?php

function twoSum($nums, $target) {
    // Your code here
    return [];
}

// Test cases
print_r(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]
print_r(twoSum([3, 2, 4], 6));       // Expected: [1, 2]
print_r(twoSum([3, 3], 6));          // Expected: [0, 1]
?>`,

    ruby: `def two_sum(nums, target)
    # Your code here
    []
end

# Test cases
puts two_sum([2, 7, 11, 15], 9).inspect # Expected: [0, 1]
puts two_sum([3, 2, 4], 6).inspect       # Expected: [1, 2]
puts two_sum([3, 3], 6).inspect          # Expected: [0, 1]`,

    swift: `func twoSum(_ nums: [Int], _ target: Int) -> [Int] {
    // Your code here
    return []
}

// Test cases
print(twoSum([2, 7, 11, 15], 9)) // Expected: [0, 1]
print(twoSum([3, 2, 4], 6))       // Expected: [1, 2]
print(twoSum([3, 3], 6))          // Expected: [0, 1]`,

    kotlin: `fun twoSum(nums: IntArray, target: Int): IntArray {
    // Your code here
    return intArrayOf()
}

fun main() {
    // Test cases
    println(twoSum(intArrayOf(2, 7, 11, 15), 9).contentToString()) // Expected: [0, 1]
    println(twoSum(intArrayOf(3, 2, 4), 6).contentToString())       // Expected: [1, 2]
    println(twoSum(intArrayOf(3, 3), 6).contentToString())          // Expected: [0, 1]
}`
}

export default function ProblemPage() {
    const [problemStatement, setProblemStatement] = useState(`# Two Sum

Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

## Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

## Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

## Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

## Constraints:
- 2 <= nums.length <= 104
- -109 <= nums[i] <= 109
- -109 <= target <= 109
- Only one valid answer exists.

## Follow-up:
Can you come up with an algorithm that is less than O(n2) time complexity?`)

    const [selectedLanguage, setSelectedLanguage] = useState("typescript")
    const [code, setCode] = useState(defaultCodeSnippets.typescript)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submissionResult, setSubmissionResult] = useState<{
        status: 'idle' | 'success' | 'error' | 'running'
        message?: string
    }>({ status: 'idle' })

    const handleLanguageChange = (newLanguage: string) => {
        setSelectedLanguage(newLanguage)
        setCode(defaultCodeSnippets[newLanguage as keyof typeof defaultCodeSnippets] || "")
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setSubmissionResult({ status: 'running', message: 'Running your solution...' })

        // Simulate submission process
        setTimeout(() => {
            const isSuccess = Math.random() > 0.3 // 70% success rate for demo
            if (isSuccess) {
                setSubmissionResult({
                    status: 'success',
                    message: 'All test cases passed! 🎉'
                })
            } else {
                setSubmissionResult({
                    status: 'error',
                    message: 'Some test cases failed. Try again!'
                })
            }
            setIsSubmitting(false)
        }, 2000)
    }

    const getStatusIcon = () => {
        switch (submissionResult.status) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />
            case 'running':
                return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
            default:
                return null
        }
    }

    return (
        <div className="h-screen bg-background">
            <ResizablePanelGroup
                direction="horizontal"
                className="rounded-lg border h-full"
            >
                <ResizablePanel defaultSize={40}>
                    <Card className="h-full rounded-none border-0">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">Problem Statement</CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                    Easy
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 h-full">
                            <ScrollArea className="h-full px-6 pb-6">
                                <Textarea
                                    value={problemStatement}
                                    onChange={(e) => setProblemStatement(e.target.value)}
                                    className="min-h-[500px] resize-none border-0 shadow-none focus-visible:ring-0 text-sm leading-relaxed"
                                    placeholder="Enter problem statement here..."
                                />
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={60}>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={80}>
                            <Card className="h-full rounded-none border-0">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-semibold">Code Editor</CardTitle>
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-muted-foreground">Language:</span>
                                                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                                                    <SelectTrigger className="w-32 h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {languages.map((language) => (
                                                            <SelectItem key={language.value} value={language.value}>
                                                                {language.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="h-8 px-4 bg-green-600 hover:bg-green-700"
                                            >
                                                <Play className="h-3 w-3 mr-1" />
                                                {isSubmitting ? 'Running...' : 'Submit'}
                                            </Button>
                                        </div>
                                    </div>
                                    {submissionResult.status !== 'idle' && (
                                        <div className="flex items-center space-x-2 text-sm">
                                            {getStatusIcon()}
                                            <span className={submissionResult.status === 'success' ? 'text-green-600' :
                                                submissionResult.status === 'error' ? 'text-red-600' :
                                                    'text-yellow-600'}>
                                                {submissionResult.message}
                                            </span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="p-0 h-full">
                                    <div className="h-full">
                                        <Editor
                                            height="100%"
                                            language={selectedLanguage}
                                            value={code}
                                            onChange={(value) => setCode(value || "")}
                                            theme="vs-dark"
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                lineNumbers: "on",
                                                roundedSelection: false,
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                                wordWrap: "on",
                                                folding: true,
                                                foldingStrategy: "indentation",
                                                padding: { top: 16, bottom: 16 },
                                                scrollbar: {
                                                    vertical: 'visible',
                                                    horizontal: 'visible',
                                                },
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={20}>
                            <Card className="h-full rounded-none border-0">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-semibold">Test Cases</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 h-full">
                                    <ScrollArea className="h-full px-6 pb-6">
                                        <div className="space-y-3">
                                            <div className="p-3 bg-muted/50 rounded-lg border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium text-muted-foreground">Test Case 1</span>
                                                    <Badge variant="outline" className="text-xs">Passed</Badge>
                                                </div>
                                                <div className="text-xs space-y-1">
                                                    <div><strong>Input:</strong> nums = [2,7,11,15], target = 9</div>
                                                    <div><strong>Expected:</strong> [0,1]</div>
                                                    <div><strong>Output:</strong> [0,1]</div>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-muted/50 rounded-lg border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium text-muted-foreground">Test Case 2</span>
                                                    <Badge variant="outline" className="text-xs">Passed</Badge>
                                                </div>
                                                <div className="text-xs space-y-1">
                                                    <div><strong>Input:</strong> nums = [3,2,4], target = 6</div>
                                                    <div><strong>Expected:</strong> [1,2]</div>
                                                    <div><strong>Output:</strong> [1,2]</div>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-muted/50 rounded-lg border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium text-muted-foreground">Test Case 3</span>
                                                    <Badge variant="outline" className="text-xs">Passed</Badge>
                                                </div>
                                                <div className="text-xs space-y-1">
                                                    <div><strong>Input:</strong> nums = [3,3], target = 6</div>
                                                    <div><strong>Expected:</strong> [0,1]</div>
                                                    <div><strong>Output:</strong> [0,1]</div>
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
} 