import Image from "next/image";
import { ClockIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";

interface ContestCardProps {
    id: string;
    title: string;
    image: string;
    startTime: string;
}



export default function ContestCard({ id, title, image, startTime }: ContestCardProps) {
    const formatTime = (time: string) => {
        const now = new Date();
        const start = new Date(time);
        const diff = start.getTime() - now.getTime();
        const diffInMinutes = Math.floor(diff / (1000 * 60));
        return diffInMinutes + "m";
    };

    const formatDate = (date: string) => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isEnded = () => {
        const now = new Date();
        const start = new Date(startTime);
        return now > start;
    };

    const url = isEnded() ? `/contests/${id}/info` : `/contests/${id}`;

    return (
        <Link href={url} className="flex flex-col gap-4">
            <Image src={image} alt="logo" width={350} height={200} className="rounded-lg object-cover w-full h-auto" />
            <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-foreground">{title}</h3>
                <div className="flex flex-row gap-2 items-center justify-between">
                    <div className="flex flex-row gap-1">
                        <ClockIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-muted-foreground">{formatDate(startTime)}</p>
                    </div>
                    <Badge className="text-sm text-muted-foreground">{isEnded() ? "Ended" : "Starts in " + formatTime(startTime)}</Badge>
                </div>
            </div>
        </Link>
    )
}
