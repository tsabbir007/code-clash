"use client";

import { useState, useEffect } from 'react';

interface ContestStats {
    problems: number;
    clarifications: number;
    announcements: number;
    participants: number;
    submissions: number;
    moderators: number;
}

export function useContestStats(contestId?: string) {
    const [stats, setStats] = useState<ContestStats>({
        problems: 0,
        clarifications: 0,
        announcements: 0,
        participants: 0,
        submissions: 0,
        moderators: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!contestId) return;

        const fetchStats = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/admin/contests/stats?contestId=${contestId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch contest stats');
                }

                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                // Fallback to default stats for demo purposes
                setStats({
                    problems: 1,
                    clarifications: 2,
                    announcements: 0,
                    participants: 1,
                    submissions: 2,
                    moderators: 1
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [contestId]);

    return { stats, loading, error };
}
