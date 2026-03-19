"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Calendar, Users, Trophy, Search, Filter, Edit, Trash2, Eye, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreateContestModal from "@/components/contest/create-contest-modal";
import EditContestModal from "@/components/contest/edit-contest-modal";
import AddProblemModal from "@/components/contest/add-problem-modal";
import { useContests } from "@/hooks/use-contests";

export default function Contests() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddProblemModal, setShowAddProblemModal] = useState(false);
    const [selectedContest, setSelectedContest] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { contests, loading, error, pagination, fetchContests, deleteContest, setPage } = useContests({
        search: searchQuery,
        status: statusFilter,
        page: 1,
    });

    useEffect(() => {
        fetchContests({ search: searchQuery, status: statusFilter, page: pagination.page });
    }, [searchQuery, statusFilter, pagination.page]);

    const handleCreateSuccess = () => {
        fetchContests();
    };

    const handleEditContest = (contest: any) => {
        setSelectedContest(contest);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        fetchContests();
        setShowEditModal(false);
        setSelectedContest(null);
    };

    const handleAddProblem = (contest: any) => {
        setSelectedContest(contest);
        setShowAddProblemModal(true);
    };

    const handleAddProblemSuccess = () => {
        fetchContests();
        setShowAddProblemModal(false);
        setSelectedContest(null);
    };

    const handleDeleteContest = async (contestId: number) => {
        if (!confirm('Are you sure you want to delete this contest? This action cannot be undone.')) return;
        try {
            await deleteContest(contestId);
        } catch (err) {
            console.error('Error deleting contest:', err);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: { [key: string]: string } = {
            'active': 'bg-green-100 text-green-800',
            'upcoming': 'bg-blue-100 text-blue-800',
            'ended': 'bg-gray-100 text-gray-800'
        };
        return variants[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <Clock className="w-4 h-4" />;
            case 'upcoming':
                return <Calendar className="w-4 h-4" />;
            case 'ended':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && contests.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading contests...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Contests</h1>
                    <p className="text-muted-foreground">
                        Manage and monitor programming contests
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Contest
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search contests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ended">Ended</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Contests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contests.map((contest) => (
                    <div key={contest.id} className="p-6 border rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                        {/* Contest Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2">{contest.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {contest.description || 'No description available'}
                                </p>
                            </div>
                            <Badge className={`${getStatusBadge(contest.status)} capitalize flex items-center gap-1`}>
                                {getStatusIcon(contest.status)}
                                {contest.status}
                            </Badge>
                        </div>

                        {/* Contest Details */}
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>Starts: {formatDate(contest.startTime)} at {formatTime(contest.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>Ends: {formatDate(contest.endTime)} at {formatTime(contest.endTime)}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{contest.participantCount} participants</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Trophy className="w-4 h-4" />
                                    <span>{contest.problemCount} problems</span>
                                </div>
                            </div>
                        </div>

                        {/* Contest Actions */}
                        <div className="flex gap-2">
                            <Link href={`/admin/contests/${contest.id}/overview`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditContest(contest)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddProblem(contest)}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteContest(contest.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {/* Create New Contest Card */}
                <div
                    onClick={() => setShowCreateModal(true)}
                    className="p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[200px]"
                >
                    <Plus className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Create New Contest</h3>
                    <p className="text-sm text-muted-foreground">
                        Start organizing a new programming contest
                    </p>
                </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-800">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-medium">Error:</span>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Modals */}
            <CreateContestModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />

            <EditContestModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedContest(null);
                }}
                onSuccess={handleEditSuccess}
                contest={selectedContest}
            />

            <AddProblemModal
                isOpen={showAddProblemModal}
                onClose={() => {
                    setShowAddProblemModal(false);
                    setSelectedContest(null);
                }}
                onSuccess={handleAddProblemSuccess}
                contestId={selectedContest?.id || 0}
            />
        </div>
    );
}