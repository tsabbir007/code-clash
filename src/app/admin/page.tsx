"use client";

import { Navbar } from "@/components/navbar/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComingSoon } from "@/components/ui/coming-soon";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Award,
    BarChart3,
    Code2,
    Trophy,
    Users
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AdminCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    badgeText?: string;
    badgeVariant?: "default" | "secondary" | "destructive" | "outline";
    href?: string;
}

interface AdminStats {
    totalProblems: number;
    totalUsers: number;
    activeUsers: number;
    totalSubmissions: number;
    recentSubmissions: number;
    successRate: number;
}

function AdminCard({ title, description, icon, badgeText, badgeVariant = "default", href }: AdminCardProps) {
    return (
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-primary/20">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {icon}
                        </div>
                        <div>
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription className="text-sm">{description}</CardDescription>
                        </div>
                        {badgeText && (
                            <Badge variant={badgeVariant} className="text-xs">
                                {badgeText}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Click to manage</span>
                    <Link href={href || ""}>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                            Open
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminPage() {
    const [currentView, setCurrentView] = useState<"dashboard" | "problems" | "contests">("dashboard");
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setIsLoadingStats(true);
            setStatsError(null);

            const response = await fetch('/api/admin/stats');
            const result = await response.json();

            if (result.success) {
                setStats(result.data);
            } else {
                setStatsError(result.error || 'Failed to fetch statistics');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStatsError('Failed to fetch statistics');
        } finally {
            setIsLoadingStats(false);
        }
    };

    useEffect(() => {
        if (currentView === "dashboard") {
            fetchStats();
        }
    }, [currentView]);

    const handleCardClick = (view: "problems" | "contests") => {
        setCurrentView(view);
    };

    const handleBackToDashboard = () => {
        setCurrentView("dashboard");
    };

    if (currentView === "problems") {
        return (
            <div className="container mx-auto px-4 pb-8 min-h-screen bg-background">
                <Navbar />

                <div className="flex flex-col items-start gap-4 mb-8">
                    <Button variant="ghost" onClick={handleBackToDashboard} className="gap-2">
                        ← Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold">Problems Management</h1>
                </div>
                <ComingSoon
                    title="Problems Management"
                    description="Advanced problem management features including creation, editing, and analytics will be available soon."
                    icon={<Code2 className="h-16 w-16 text-primary" />}
                />
            </div>
        );
    }

    if (currentView === "contests") {
        return (
            <div className="container mx-auto px-4 pb-8 min-h-screen bg-background">
                <Navbar />
                <div className="flex flex-col items-start gap-4 mb-8">
                    <Button variant="ghost" onClick={handleBackToDashboard} className="gap-2">
                        ← Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold">Contests Management</h1>
                </div>
                <ComingSoon
                    title="Contests Management"
                    description="Create and manage programming contests with real-time leaderboards and automated judging."
                    icon={<Trophy className="h-16 w-16 text-primary" />}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pb-8 min-h-screen bg-background">
            <Navbar />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-lg text-muted-foreground">
                    Manage your platform's problems, contests, and system settings
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                <Code2 className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Problems</p>
                                {isLoadingStats ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Skeleton className="h-5 w-12" />
                                    </div>
                                ) : statsError ? (
                                    <p className="text-sm text-red-500">Error</p>
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.totalProblems || 0}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 text-green-600">
                                <Users className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Users</p>
                                {isLoadingStats ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Skeleton className="h-5 w-12" />
                                    </div>
                                ) : statsError ? (
                                    <p className="text-sm text-red-500">Error</p>
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                                <Users className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active Users</p>
                                {isLoadingStats ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Skeleton className="h-5 w-12" />
                                    </div>
                                ) : statsError ? (
                                    <p className="text-sm text-red-500">Error</p>
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.activeUsers || 0}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                <BarChart3 className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Submissions</p>
                                {isLoadingStats ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Skeleton className="h-5 w-12" />
                                    </div>
                                ) : statsError ? (
                                    <p className="text-sm text-red-500">Error</p>
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.totalSubmissions || 0}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                                <BarChart3 className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Recent Submissions (7d)</p>
                                {isLoadingStats ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Skeleton className="h-5 w-12" />
                                    </div>
                                ) : statsError ? (
                                    <p className="text-sm text-red-500">Error</p>
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.recentSubmissions || 0}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                                <Award className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Success Rate</p>
                                {isLoadingStats ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Skeleton className="h-5 w-12" />
                                    </div>
                                ) : statsError ? (
                                    <p className="text-sm text-red-500">Error</p>
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.successRate || 0}%</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Error Message */}
            {statsError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                        <span className="text-sm font-medium">Failed to load statistics:</span>
                        <span className="text-sm">{statsError}</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchStats}
                        className="mt-2"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Main Admin Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminCard
                    title="Problems Management"
                    description="Create, edit, and manage programming problems with test cases and solutions"
                    icon={<Code2 className="h-6 w-6" />}
                    badgeText="Active"
                    badgeVariant="default"
                    href="/admin/problems"
                />

                <AdminCard
                    title="Contests Management"
                    description="Organize programming contests with real-time leaderboards and automated judging"
                    icon={<Trophy className="h-6 w-6" />}
                    badgeText="Active"
                    badgeVariant="default"
                    href="/admin/contests"
                />
            </div>
        </div>
    );
}
