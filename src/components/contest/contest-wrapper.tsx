import ContestCard from "@/components/contest/contest-card";
import { ContestListWrapper } from "./constest-list-wrapper";
import { contests } from "@/data/dummy-data";

export default function ContestWrapper() {
  return (
    <div className="flex flex-col gap-10 items-center p-4">
      <div className="flex flex-row justify-between gap-4">
        {contests.map((contest) => (
          <ContestCard key={contest.id} {...contest} />
        ))}
      </div>
      <ContestListWrapper />
    </div>
  );
}
