import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { contests } from "@/data/dummy-data"
import { ContestListCard } from "./contest-list-card"
import { InfoIcon } from "lucide-react"
import { Button } from "../ui/button"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

export function ContestList() {

    const tabList = [
        {
            label: "Past Contests",
            value: "past-contests"
        },
        {
            label: "Upcoming Contests",
            value: "upcoming-contests"
        },
        {
            label: "My Contests",
            value: "my-contests"
        }
    ]

    return (
        <div className="flex w-full gap-6 flex-col">
            <Tabs defaultValue={tabList[0].value} className="gap-5">
                <div className="flex flex-row items-center gap-5 justify-between">
                    <TabsList className="gap-5 h-12 bg-transparent justify-between">
                        {tabList.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="text-sm font-medium data-[state=active]:border-none hover:cursor-pointer hover:!text-foreground"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}

                    </TabsList>
                    {/* TODO: Add tooltip */}
                    <p className="flex flex-row items-center gap-1 text-xs text-muted-foreground"><InfoIcon className="size-3" /> What is Virtual Contest?</p>
                </div>
                <TabsContent value="past-contests">
                    <div className="flex flex-col gap-5 w-full">
                        {contests.map((contest) => (
                            <ContestListCard key={contest.title} {...contest} />
                        ))}

                        <CustomPagination />
                    </div>

                </TabsContent>
                <TabsContent value="my-contests">
                    <div className="min-h-[300px] flex w-full flex-col items-center justify-center">
                        <div className="text-base font-medium text-foreground">🏆 Join CodeClash Contests</div>
                        <div className="text-md mt-2 text-muted-foreground">Register or sign in to view your personalized contest information</div>
                        <Button className="cursor-pointer mt-6 bg-green-600 hover:bg-green-600/90 text-white">Register or Sign In</Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}


export function CustomPagination() {
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#" isActive>
                        2
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext href="#" />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
