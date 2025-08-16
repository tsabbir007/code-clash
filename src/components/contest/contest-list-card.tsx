import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Trophy, LockIcon } from "lucide-react"
import Image from "next/image"

interface ContestListCardProps {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    isRegistered?: boolean;
}

export function ContestListCard({ id, title, description, startTime, endTime, isRegistered }: ContestListCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateMobile = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isContestActive = () => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);
        return now >= start && now <= end;
    };

    const isContestUpcoming = () => {
        const now = new Date();
        const start = new Date(startTime);
        return now < start;
    };

    const getStatusBadge = () => {
        if (isContestActive()) {
            return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Active</span>;
        } else if (isContestUpcoming()) {
            return <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Upcoming</span>;
        } else {
            return <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">Ended</span>;
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex justify-center sm:justify-start">
                <Image
                    className="w-full h-auto md:h-18 md:w-28 rounded"
                    src={`/contest/contest-card-${id % 3 + 1}.png`}
                    alt="contest"
                    width={200}
                    height={100}
                />
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-3 sm:gap-0">
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="text-base md:text-lg font-semibold text-foreground text-center sm:text-left">{title}</h3>
                        <div className="flex justify-center sm:justify-start">
                            {getStatusBadge()}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="hidden md:inline">Start: {formatDate(startTime)}</span>
                            <span className="md:hidden">Start: {formatDateMobile(startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="hidden md:inline">End: {formatDate(endTime)}</span>
                            <span className="md:hidden">End: {formatDateMobile(endTime)}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                    {isContestActive() ? (
                        <Button asChild className="h-8 md:h-7 rounded-sm text-xs w-full sm:w-auto">
                            {isRegistered ? (
                                <Link className="text-purple-500" href={`/contests/${id}`}>Enter</Link>
                            ) : (
                                <Link className="!text-muted-foreground" href={`/contests/${id}`}>
                                    <LockIcon className="size-3" /> Register
                                </Link>
                            )}
                        </Button>
                    ) : isContestUpcoming() ? (
                        <Button asChild className="h-8 md:h-7 rounded-sm text-xs w-full sm:w-auto">
                            <Link className="text-purple-500" href={`/contests/${id}`}>Register</Link>
                        </Button>
                    ) : (
                        <Button asChild className="h-8 md:h-7 rounded-sm text-xs w-full sm:w-auto">
                            <Link className="text-purple-500" href={`/contests/${id}/info`}>View</Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}