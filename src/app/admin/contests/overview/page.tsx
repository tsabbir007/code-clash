"use client";

import { useContestStats } from "@/hooks/use-contest-stats";
import { Calendar, Users, Trophy, Clock, TrendingUp, AlertCircle, FileText, Wrench, Megaphone, MessageSquare } from "lucide-react";

export default function ContestOverview() {
    const { stats, loading } = useContestStats("1");

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Contest Overview</h1>
                    <p className="text-muted-foreground">
                        Loading contest statistics...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Contest Overview</h1>
                <p className="text-muted-foreground">
                    Manage and monitor your programming contest
                </p>
            </div>

            {/* Contest Status */}
            <div className="p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 className="font-semibold text-lg">Code Clash 2024 - Active</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Dec 15 - Dec 20, 2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>5 days remaining</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{stats.participants} participants</span>
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Problems</h3>
                            <p className="text-2xl font-bold text-blue-600">{stats.problems}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Participants</h3>
                            <p className="text-2xl font-bold text-green-600">{stats.participants}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Submissions</h3>
                            <p className="text-2xl font-bold text-purple-600">{stats.submissions}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Pending Questions</h3>
                            <p className="text-2xl font-bold text-orange-600">{stats.clarifications}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Add New Problem</p>
                                    <p className="text-sm text-muted-foreground">Create a new contest problem</p>
                                </div>
                            </div>
                        </button>

                        <button className="w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Megaphone className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Make Announcement</p>
                                    <p className="text-sm text-muted-foreground">Notify all participants</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">New submission received</p>
                                <p className="text-xs text-muted-foreground">2 minutes ago</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">New participant joined</p>
                                <p className="text-xs text-muted-foreground">1 hour ago</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Clarification requested</p>
                                <p className="text-xs text-muted-foreground">3 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
