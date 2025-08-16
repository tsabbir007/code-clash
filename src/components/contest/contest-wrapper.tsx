"use client";

import ContestCard from "@/components/contest/contest-card";
import { Contest, ContestListWrapper } from "./constest-list-wrapper";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ContestWrapper() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 md:gap-10 items-center p-4">
      {/* Featured Contests Carousel */}
      {contests.length > 0 && (
        <div className="w-full max-w-6xl">

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {contests.slice(0, 6).map((contest: Contest) => (
                <CarouselItem key={contest.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <ContestCard
                      id={contest.id.toString()}
                      title={contest.title}
                      image={`/contest/contest-card-${contest.id % 3 + 1}.png`}
                      startTime={contest.startTime}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="flex top-[37%] -left-4 md:-left-12" />
            <CarouselNext className="flex top-[37%] -right-4 md:-right-12" />
          </Carousel>
        </div>
      )}

      {/* All Contests List */}
      <div className="w-full max-w-6xl">
        <ContestListWrapper />
      </div>
    </div>
  );
}
