import Image from "next/image";
import { ClockIcon } from "lucide-react";
import Link from "next/link";

interface ContestCardProps {
    id: string;
    title: string;
    image: string;
    startsIn: string;
}

export default function ContestCard({ id, title, image, startsIn }: ContestCardProps) {
    return (
        <Link href={`/contest/${id}`} className="flex flex-col gap-4">
            <Image src={image} alt="logo" width={350} height={200} className="rounded-lg" />
            <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-foreground">{title}</h3>
                <div className="flex flex-row gap-2">
                    <ClockIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground">Starts in <span>{startsIn}</span></p>
                </div>
            </div>
        </Link>
    )
}
