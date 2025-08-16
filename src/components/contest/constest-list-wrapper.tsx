'use client';

import { useState, useEffect } from 'react';
import { ContestList } from "./constest-list";

export interface Contest {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isRegistered?: boolean;
}

export function ContestListWrapper() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [myContests, setMyContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contests' | 'my-contests'>('contests');

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);

      // Fetch all contests
      const contestsResponse = await fetch('/api/contests');
      if (contestsResponse.ok) {
        const contestsData = await contestsResponse.json();
        if (contestsData.success) {
          setContests(contestsData.data || []);
        }
      }

      // Fetch user's registered contests
      const myContestsResponse = await fetch('/api/contests/my');
      if (myContestsResponse.ok) {
        const myContestsData = await myContestsResponse.json();
        if (myContestsData.success) {
          setMyContests(myContestsData.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex container flex-col gap-6 bg-muted p-4 rounded-lg">
      <ContestList
        contests={contests}
        myContests={myContests}
        loading={loading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={fetchContests}
      />
    </div>
  );
}
