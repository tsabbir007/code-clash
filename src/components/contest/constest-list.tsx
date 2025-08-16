import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
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

interface Contest {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    isRegistered?: boolean;
}

interface ContestListProps {
    contests: Contest[];
    myContests: Contest[];
    loading: boolean;
    activeTab: 'contests' | 'my-contests';
    onTabChange: (value: 'contests' | 'my-contests') => void;
    onRefresh: () => void;
}

export function ContestList({ contests, myContests, loading, activeTab, onTabChange, onRefresh }: ContestListProps) {

    const tabList = [
        {
            label: "Contests",
            value: "contests"
        },
        {
            label: "My Contests",
            value: "my-contests"
        }
    ]

    if (loading) {
        return (
            <div className="flex w-full gap-4 md:gap-6 flex-col">
                <div className="flex items-center justify-center h-48 md:h-64">
                    <div className="text-center">
                        <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm md:text-base text-muted-foreground">Loading contests...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full gap-4 md:gap-6 flex-col">
            <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'contests' | 'my-contests')} className="gap-4 md:gap-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 justify-between">
                    <TabsList className="gap-2 md:gap-5 h-10 md:h-12 bg-transparent justify-between w-full sm:w-auto">
                        {tabList.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="text-xs md:text-sm font-medium data-[state=active]:border-none hover:cursor-pointer hover:!text-foreground flex-1 sm:flex-none"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <p className="flex flex-row items-center gap-1 text-xs text-muted-foreground w-full sm:w-auto justify-center sm:justify-end">
                        <InfoIcon className="size-3" />
                        <span className="hidden sm:inline">How to participate?</span>
                        <span className="sm:hidden">How to participate?</span>
                    </p>
                </div>

                <TabsContent value="contests">
                    <div className="flex flex-col gap-3 md:gap-5 w-full">
                        {contests.length === 0 ? (
                            <div className="min-h-[200px] md:min-h-[300px] flex w-full flex-col items-center justify-center p-4">
                                <div className="text-sm md:text-base font-medium text-foreground text-center">🏆 No Contests Available</div>
                                <div className="text-xs md:text-sm mt-2 text-muted-foreground text-center">Check back later for upcoming contests</div>
                            </div>
                        ) : (
                            <>
                                {contests.map((contest) => (
                                    <ContestListCard key={contest.id} {...contest} />
                                ))}
                                {/* <CustomPagination /> */}
                            </>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="my-contests">
                    <div className="flex flex-col gap-3 md:gap-5 w-full">
                        {myContests.length === 0 ? (
                            <div className="min-h-[200px] md:min-h-[300px] flex w-full flex-col items-center justify-center p-4">
                                <div className="text-sm md:text-base font-medium text-foreground text-center">🏆 Join CodeClash Contests</div>
                                <div className="text-xs md:text-sm mt-2 text-muted-foreground text-center px-4">Register or sign in to view your personalized contest information</div>
                                <Button className="cursor-pointer mt-4 md:mt-6 bg-green-600 hover:bg-green-600/90 text-white text-sm md:text-base px-4 py-2">Register or Sign In</Button>
                            </div>
                        ) : (
                            <>
                                {myContests.map((contest) => (
                                    <ContestListCard key={contest.id} {...contest} />
                                ))}
                                {/* <CustomPagination /> */}
                            </>
                        )}
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
