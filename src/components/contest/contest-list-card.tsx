import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Trophy } from "lucide-react"

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
            return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>;
        } else if (isContestUpcoming()) {
            return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Upcoming</span>;
        } else {
            return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Ended</span>;
        }
    };

    return (
        <div className="flex flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex flex-col justify-center items-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                <Trophy className="w-8 h-8" />
            </div>
            <div className="flex flex-row justify-between items-center w-full">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                        {getStatusBadge()}
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md">{description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Start: {formatDate(startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>End: {formatDate(endTime)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    {isRegistered ? (
                        <Button asChild className="bg-green-600 hover:bg-green-700">
                            <Link href={`/contests/${id}`}>Enter Contest</Link>
                        </Button>
                    ) : (
                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                            <Link href={`/contests/${id}`}>View Contest</Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}