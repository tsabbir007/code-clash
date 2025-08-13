"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface Problem {
    id: number;
    title: string;
    timeLimit: number;
    memoryLimit: number;
}

export default function LimitsPage() {
    const params = useParams();
    const problemId = params.problemId as string;

    const [problem, setProblem] = useState<Problem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [timeLimit, setTimeLimit] = useState(1000);
    const [memoryLimit, setMemoryLimit] = useState(256);

    useEffect(() => {
        loadLimits();
    }, [problemId]);

    const loadLimits = async () => {
        try {
            const response = await fetch(`/api/problems/${problemId}/limits`);
            const data = await response.json();

            if (data.success) {
                setProblem(data.problem);
                setTimeLimit(data.problem.timeLimit || 1000);
                setMemoryLimit(data.problem.memoryLimit || 256);
            } else {
                toast.error(data.error || 'Failed to load limits');
            }
        } catch (error) {
            console.error('Error loading limits:', error);
            toast.error('Failed to load limits');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        // Validate limits
        if (timeLimit < 100 || timeLimit > 10000) {
            toast.error('Time limit must be between 100ms and 10,000ms');
            return;
        }

        if (memoryLimit < 16 || memoryLimit > 512000) {
            toast.error('Memory limit must be between 16KB and 512,000KB');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`/api/problems/${problemId}/limits`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timeLimit,
                    memoryLimit,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Limits saved successfully!');
                setProblem(prev => prev ? { ...prev, timeLimit, memoryLimit } : null);
            } else {
                toast.error(data.error || 'Failed to save limits');
            }
        } catch (error) {
            console.error('Error saving limits:', error);
            toast.error('Failed to save limits');
        } finally {
            setIsSaving(false);
        }
    };

    const formatTime = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    const formatMemory = (kb: number) => {
        if (kb < 1024) return `${kb}KB`;
        return `${(kb / 1024).toFixed(1)}MB`;
    };

    if (isLoading) {
        return (
            <div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading limits...</div>
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
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Problem Limits</h1>
                <p className="text-muted-foreground">
                    Set computational constraints for problem: {problem.title}
                </p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                {/* Time Limit */}
                <Card>
                    <CardHeader>
                        <CardTitle>Time Limit</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Maximum execution time allowed for solutions
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="time-limit">Time Limit (milliseconds)</Label>
                            <div className="flex items-center gap-4">
                                <Slider
                                    value={[timeLimit]}
                                    onValueChange={(value) => setTimeLimit(value[0])}
                                    min={100}
                                    max={10000}
                                    step={100}
                                    className="flex-1"
                                />
                                <Input
                                    id="time-limit"
                                    type="number"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 1000)}
                                    min={100}
                                    max={10000}
                                    className="w-24"
                                />
                                <span className="text-sm text-muted-foreground min-w-[60px]">
                                    {formatTime(timeLimit)}
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Range: 100ms - 10,000ms (10 seconds)
                        </div>
                    </CardContent>
                </Card>

                {/* Memory Limit */}
                <Card>
                    <CardHeader>
                        <CardTitle>Memory Limit</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Maximum memory usage allowed for solutions
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="memory-limit">Memory Limit (kilobytes)</Label>
                            <div className="flex items-center gap-4">
                                <Slider
                                    value={[memoryLimit]}
                                    onValueChange={(value) => setMemoryLimit(value[0])}
                                    min={16}
                                    max={512000}
                                    step={1024}
                                    className="flex-1"
                                />
                                <Input
                                    id="memory-limit"
                                    type="number"
                                    value={memoryLimit}
                                    onChange={(e) => setMemoryLimit(parseInt(e.target.value) || 256)}
                                    min={16}
                                    max={512000}
                                    className="w-24"
                                />
                                <span className="text-sm text-muted-foreground min-w-[60px]">
                                    {formatMemory(memoryLimit)}
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Range: 16KB - 512MB
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Limits'}
                    </Button>
                </div>

                {/* Current Limits Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Limits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Time Limit</div>
                                <div className="text-lg font-semibold">{formatTime(timeLimit)}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Memory Limit</div>
                                <div className="text-lg font-semibold">{formatMemory(memoryLimit)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
