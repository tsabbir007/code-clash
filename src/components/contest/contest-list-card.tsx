import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LockIcon } from "lucide-react"

interface ContestListCardProps {
    title: string;
    image: string;
    date: string;
    isAllowVirtual: boolean;
    virtualLink?: string;
}

export function ContestListCard({ title, image, date, isAllowVirtual }: ContestListCardProps) {
    return (
        <div className="flex flex-row gap-4">
            <Image
                src={image}
                alt={title}
                width={125}
                height={85}
                className="rounded-md"
            />
            <div className="flex flex-row justify-between items-center w-full">
                <div className="flex flex-col gap-1">
                    <h3 className="text-base font-medium text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{date}</p>
                </div>
                <div>
                    <Button disabled={!isAllowVirtual} asChild={!isAllowVirtual} className="h-7 rounded-sm text-xs">
                        {isAllowVirtual ? (
                            <Link className="text-purple-500" href="/contest/allow-virtual">Virtual</Link>
                        ) : (
                            <span className="!text-muted-foreground">
                                <LockIcon className="size-3" /> Virtual
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}