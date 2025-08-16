'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { handleApiResponse, showErrorToast, showSuccessToast } from '@/lib/utils';
import {
    Calendar,
    Clock,
    Users,
    FileText,
    Target,
    Search,
    Filter,
    Trophy,
    Play,
    UserPlus,
    Eye
} from 'lucide-react';

interface Contest {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    isPublic: boolean;
    participants: number;
    problems: number;
    totalPoints: number;
}

export default function ContestsPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [registeringContest, setRegisteringContest] = useState<number | null>(null);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/contests');
            const apiResponse = await handleApiResponse(response, 'Contests loaded successfully', 'Failed to fetch contests');

            if (apiResponse.success) {
                setContests(apiResponse.data || []);
            } else {
                setContests([]);
            }
        } catch (error) {
            console.error('Error fetching contests:', error);
            setError('Failed to fetch contests');
            setContests([]);
        } finally {
            setLoading(false);
        }
    };

    const registerForContest = async (contestId: number) => {
        try {
            setRegisteringContest(contestId);

            const response = await fetch(`/api/contests/${contestId}/register`, {
                method: 'POST',
            });

            const apiResponse = await handleApiResponse(response, 'Successfully registered for the contest!', 'Failed to register for contest');

            if (apiResponse.success) {
                // Refresh contests to update participant count
                await fetchContests();
            }
        } catch (error) {
            console.error('Error registering for contest:', error);
            showErrorToast('Failed to register for contest');
        } finally {
            setRegisteringContest(null);
        }
    };

    const getContestStatus = (startTime: string, endTime: string) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now < start) {
            return { status: 'upcoming', color: 'bg-blue-100 text-blue-800', label: 'Upcoming' };
        } else if (now >= start && now <= end) {
            return { status: 'active', color: 'bg-green-100 text-green-800', label: 'Active' };
        } else {
            return { status: 'ended', color: 'bg-red-100 text-red-800', label: 'Ended' };
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatDuration = (startTime: string, endTime: string) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end.getTime() - start.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const filteredContests = (contests || []).filter((contest: Contest) => {
        const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contest.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            getContestStatus(contest.startTime, contest.endTime).status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading contests...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-semibold mb-2">Error Loading Contests</h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={fetchContests}>Try Again</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">Programming Contests</h1>
                <p className="text-xl text-muted-foreground">
                    Join exciting programming challenges and compete with coders worldwide
                </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search contests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Contests</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="ended">Ended</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Contests Grid */}
            {filteredContests.length === 0 ? (
                <div className="text-center py-16">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No contests found</h3>
                    <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'No contests are available at the moment'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContests.map((contest: Contest) => {
                        const status = getContestStatus(contest.startTime, contest.endTime);
                        const isActive = status.status === 'active';
                        const isUpcoming = status.status === 'upcoming';

                        return (
                            <Card key={contest.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg mb-2">{contest.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {contest.description || 'No description available'}
                                            </CardDescription>
                                        </div>
                                        <Badge className={status.color}>
                                            {status.label}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Contest Info */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span>Start: {formatDateTime(contest.startTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <span>Duration: {formatDuration(contest.startTime, contest.endTime)}</span>
                                        </div>
                                    </div>

                                    {/* Statistics */}
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-blue-600">{contest.participants}</div>
                                            <div className="text-xs text-muted-foreground">Participants</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-green-600">{contest.problems}</div>
                                            <div className="text-xs text-muted-foreground">Problems</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-purple-600">{contest.totalPoints}</div>
                                            <div className="text-xs text-muted-foreground">Points</div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {isActive && (
                                            <Button
                                                className="flex-1"
                                                onClick={() => window.location.href = `/contests/${contest.id}`}
                                            >
                                                <Play className="w-4 h-4 mr-2" />
                                                Enter Contest
                                            </Button>
                                        )}

                                        {isUpcoming && (
                                            <Button
                                                className="flex-1"
                                                variant="outline"
                                                onClick={() => registerForContest(contest.id)}
                                                disabled={registeringContest === contest.id}
                                            >
                                                {registeringContest === contest.id ? (
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                                ) : (
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                )}
                                                Register
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.location.href = `/contests/${contest.id}/info`}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
