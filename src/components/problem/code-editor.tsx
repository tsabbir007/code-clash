"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader, Play, RotateCcw, Download, Upload } from "lucide-react"
import Editor from "@monaco-editor/react"

interface CodeEditorProps {
    code: string
    onCodeChange: (code: string) => void
    language: string
    onLanguageChange: (language: string) => void
    onSubmit: () => void
    isSubmitting: boolean
    isAuthenticated: boolean
    onLoginClick?: () => void
    onRegisterClick?: () => void
}

interface Language {
    value: string
    label: string
    extension: string
    icon: string
    monacoLanguage: string
}

const languages: Language[] = [
    { value: "cpp", label: "C++", extension: "cpp", icon: "⚡", monacoLanguage: "cpp" },
    { value: "java", label: "Java", extension: "java", icon: "☕", monacoLanguage: "java" },
    { value: "python", label: "Python 3", extension: "py", icon: "🐍", monacoLanguage: "python" },
    { value: "javascript", label: "JavaScript", extension: "js", icon: "🟨", monacoLanguage: "javascript" }
]

export function CodeEditor({
    code,
    onCodeChange,
    language,
    onLanguageChange,
    onSubmit,
    isSubmitting,
    isAuthenticated,
    onLoginClick,
    onRegisterClick
}: CodeEditorProps) {
    const editorRef = useRef<any>(null)

    const getCodeTemplate = (lang: string): string => {
        switch (lang) {
            case 'python':
                return `# Python solution for competitive programming
# This template provides a good starting point for most problems

def solve():
    # Read input
    n = int(input())
    
    # Process the problem
    result = 0
    for i in range(n):
        # Your logic here
        pass
    
    # Output result
    print(result)

if __name__ == "__main__":
    solve()`
            case 'cpp':
                return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    // Read input
    int n;
    cin >> n;
    
    // Process the problem
    int result = 0;
    for (int i = 0; i < n; i++) {
        // Your logic here
    }
    
    // Output result
    cout << result << endl;
    
    return 0;
}`
            case 'java':
                return `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        // Read input
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        
        // Process the problem
        int result = 0;
        for (int i = 0; i < n; i++) {
            // Your logic here
        }
        
        // Output result
        System.out.println(result);
    }
}`
            case 'javascript':
                return `// JavaScript solution for competitive programming
// This template provides a good starting point for most problems

function solve() {
    // Read input (assuming input is provided as a string)
    const input = require('fs').readFileSync('/dev/stdin', 'utf8');
    const lines = input.trim().split('\\n');
    
    // Process the problem
    const n = parseInt(lines[0]);
    let result = 0;
    
    for (let i = 0; i < n; i++) {
        // Your logic here
    }
    
    // Output result
    console.log(result);
}

solve();`
            default:
                return `// ${lang} solution
// Your code here
// This is a template for ${lang} programming
// Add your logic below`
        }
    }

    const handleLanguageChange = (newLang: string) => {
        onLanguageChange(newLang)
        // Reset code to template when language changes
        onCodeChange(getCodeTemplate(newLang))
    }

    const resetCode = () => {
        onCodeChange(getCodeTemplate(language))
    }

    const downloadCode = () => {
        const element = document.createElement('a')
        const file = new Blob([code], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        const currentLanguage = languages.find(l => l.value === language)
        element.download = `solution.${currentLanguage?.extension || 'txt'}`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    const uploadCode = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.cpp,.java,.py,.js,.txt'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    const content = e.target?.result as string
                    onCodeChange(content)
                }
                reader.readAsText(file)
            }
        }
        input.click()
    }

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor
        // Focus the editor
        editor.focus()
    }

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            onCodeChange(value)
        }
    }

    // Initialize code with template when component mounts or language changes
    useEffect(() => {
        if (!code.trim()) {
            onCodeChange(getCodeTemplate(language))
        }
    }, [language])

    const currentLanguage = languages.find(l => l.value === language)

    return (
        <Card className="w-full h-full border-0 shadow-lg py-0 gap-0">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/50">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Code Editor
                </CardTitle>
                <div className="flex items-center gap-3">
                    <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-40 h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    <div className="flex items-center gap-2">
                                        <span>{lang.icon}</span>
                                        <span>{lang.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Badge variant="secondary" className="text-xs">
                        {currentLanguage?.extension.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-0 w-full h-full">
                {/* Monaco Editor */}
               
                    <Editor
                        height="100%"
                        defaultLanguage={currentLanguage?.monacoLanguage || "plaintext"}
                        language={currentLanguage?.monacoLanguage || "plaintext"}
                        value={code}
                        onChange={handleEditorChange}
                        onMount={handleEditorDidMount}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', monospace",
                            lineNumbers: "on",
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            wordWrap: "on",
                            suggestOnTriggerCharacters: true,
                            quickSuggestions: true,
                            parameterHints: { enabled: true },
                            hover: { enabled: true },
                            formatOnPaste: true,
                            formatOnType: true,
                            tabSize: 4,
                            insertSpaces: true,
                            detectIndentation: true,
                            trimAutoWhitespace: true,
                            largeFileOptimizations: true,
                            folding: true,
                            foldingStrategy: "indentation",
                            showFoldingControls: "always",
                            matchBrackets: "always",
                            autoClosingBrackets: "always",
                            autoClosingQuotes: "always",
                            autoClosingOvertype: "always",
                            autoSurround: "quotes",
                            autoIndent: "full",
                            dragAndDrop: true,
                            links: true,
                            colorDecorators: true
                        }}
                    />
               
            </CardContent>

            <CardFooter>
                <div className="absolute bottom-0 left-0 right-3 p-3">
                    <div className="flex items-center justify-end">
                        {/* <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetCode}
                                className="h-8 text-xs"
                            >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Reset
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadCode}
                                className="h-8 text-xs"
                            >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={uploadCode}
                                className="h-8 text-xs"
                            >
                                <Upload className="h-3 w-3 mr-1" />
                                Upload
                            </Button>
                        </div> */}

                        <div className="flex items-center gap-2">
                            {!isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onLoginClick}
                                        className="h-8 text-xs"
                                    >
                                        Log In
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onRegisterClick}
                                        className="h-8 text-xs"
                                    >
                                        Register
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={onSubmit}
                                    disabled={isSubmitting || !code.trim()}
                                    className="h-8 px-4 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader className="w-3 h-3 mr-2 animate-spin" />
                                            Running...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-3 w-3 mr-2" />
                                            Run Code
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
