"use client";

import { useState, useEffect, useCallback } from 'react';
import { handleApiResponse, showErrorToast, showSuccessToast } from '@/lib/utils';

interface Contest {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    isPublic: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    participantCount: number;
    problemCount: number;
    status: 'upcoming' | 'active' | 'ended';
}

interface ContestsResponse {
    contests: Contest[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface UseContestsOptions {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

export function useContests(options: UseContestsOptions = {}) {
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: options.page || 1,
        limit: options.limit || 10,
        total: 0,
        totalPages: 0
    });

    const fetchContests = useCallback(async (params: UseContestsOptions = {}) => {
        try {
            setLoading(true);
            setError(null);

            const searchParams = new URLSearchParams({
                page: (params.page || pagination.page).toString(),
                limit: (params.limit || pagination.limit).toString(),
                search: params.search || '',
                status: params.status || ''
            });

            const response = await fetch(`/api/admin/contests?${searchParams}`);
            const apiResponse = await handleApiResponse(response, 'Contests loaded successfully', 'Failed to fetch contests');

            if (apiResponse.success) {
                const data = apiResponse.data as ContestsResponse;
                setContests(data.contests);
                setPagination(data.pagination);
                return data;
            }

            throw new Error('Failed to fetch contests');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit]);

    const createContest = useCallback(async (contestData: {
        title: string;
        description: string;
        startTime: string;
        endTime: string;
        isPublic: boolean;
        createdBy: string;
    }) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/admin/contests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contestData),
            });

            const apiResponse = await handleApiResponse(response, 'Contest created successfully', 'Failed to create contest');

            if (apiResponse.success) {
                const newContest = apiResponse.data;

                // Refresh the contests list
                await fetchContests();

                return newContest;
            }

            throw new Error('Failed to create contest');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchContests]);

    const updateContest = useCallback(async (contestId: number, updates: Partial<{
        title: string;
        description: string;
        startTime: string;
        endTime: string;
        isPublic: boolean;
    }>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/admin/contests/${contestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            const apiResponse = await handleApiResponse(response, 'Contest updated successfully', 'Failed to update contest');

            if (apiResponse.success) {
                const updatedContest = apiResponse.data;

                // Update the local state
                setContests(prev => prev.map(contest =>
                    contest.id === contestId ? { ...contest, ...updatedContest } : contest
                ));

                return updatedContest;
            }

            throw new Error('Failed to update contest');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteContest = useCallback(async (contestId: number) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/admin/contests/${contestId}`, {
                method: 'DELETE',
            });

            const apiResponse = await handleApiResponse(response, 'Contest deleted successfully', 'Failed to delete contest');

            if (apiResponse.success) {
                // Remove from local state
                setContests(prev => prev.filter(contest => contest.id !== contestId));

                // Update pagination
                setPagination(prev => ({
                    ...prev,
                    total: Math.max(0, prev.total - 1)
                }));

                return true;
            }

            throw new Error('Failed to delete contest');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getContestById = useCallback(async (contestId: number) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/admin/contests/${contestId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch contest');
            }

            const contestData = await response.json();
            return contestData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshContests = useCallback(() => {
        return fetchContests();
    }, [fetchContests]);

    const setPage = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
    }, []);

    const setLimit = useCallback((limit: number) => {
        setPagination(prev => ({ ...prev, limit, page: 1 }));
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchContests(options);
    }, [fetchContests, options.page, options.limit, options.search, options.status]);

    return {
        contests,
        loading,
        error,
        pagination,
        fetchContests,
        createContest,
        updateContest,
        deleteContest,
        getContestById,
        refreshContests,
        setPage,
        setLimit,
        setError
    };
}
