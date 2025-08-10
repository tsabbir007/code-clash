"use client"

import { useEffect, useState } from "react"

import { Navbar } from "@/components/navbar/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Loader2, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Utility function for case-insensitive difficulty comparison
const normalizeDifficulty = (difficulty: string): string => {
    if (!difficulty) return '';
    return difficulty.toLowerCase();
};

const isDifficultyMatch = (problemDifficulty: string, filterDifficulty: string): boolean => {
    return normalizeDifficulty(problemDifficulty) === normalizeDifficulty(filterDifficulty);
};

interface carouselItem {
    image: string;
    url: string;
}

enum Difficulty {
    EASY = "Easy",
    MEDIUM = "Medium",
    HARD = "Hard",
}

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    description: string;
    timeLimit: number;
    memoryLimit: number;
    categories: Array<{
        id: number;
        name: string;
        color: string;
    }>;
    userName: string;
}

interface Category {
    id: number;
    name: string;
    color: string;
}

export default function ProblemSet() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [difficulties] = useState<string[]>(["All", "Easy", "Medium", "Hard"]);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const carouselItems: carouselItem[] = [
        {
            image: "/problemset/problem-card-1.jpeg",
            url: "/problemset"
        },
        {
            image: "/problemset/problem-card-2.png",
            url: "/problemset"
        },
        {
            image: "/problemset/problem-card-3.png",
            url: "/problemset"
        },
        {
            image: "/problemset/problem-card-4.png",
            url: "/problemset"
        },
    ]

    const loadProblems = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                perPage: '10',
                ...(selectedCategory !== 'All' && { category: selectedCategory }),
                ...(selectedDifficulty !== 'All' && { difficulty: selectedDifficulty }),
                ...(debouncedSearchQuery && { search: debouncedSearchQuery })
            });

            const response = await fetch(`/api/problems/public?${params}`);
            const data = await response.json();

            if (data.success) {
                setProblems(data.problems);
                setCategories(data.categories);
                setTotalPages(data.pagination.totalPages);
            } else {
                console.error('Failed to load problems:', data.error);
            }
        } catch (error) {
            console.error('Error loading problems:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        loadProblems();
    }, [currentPage, selectedCategory, selectedDifficulty, debouncedSearchQuery]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

    const handleDifficultyChange = (difficulty: string) => {
        setSelectedDifficulty(difficulty);
        setCurrentPage(1);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    return (
        <div className="flex flex-col container">
            <Navbar />
            <div className="mt-2 flex flex-col gap-8">
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full z-0"
                >
                    <CarouselContent className="-ml-1">
                        {carouselItems.map((item, index) => (
                            <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                                <Image src={item.image} alt="problem-card" width={320} height={135} className="rounded-lg" />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>

                <div className="flex flex-col gap-5">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search by problem title, description, or category..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>



                    {/* Category and Difficulty Filters */}
                    <div className="flex flex-row justify-between items-center border-b pb-5">
                        <div className="flex flex-row gap-2">
                            <Button
                                variant={selectedCategory === "All" ? "default" : "outline"}
                                className={cn(
                                    "rounded-full",
                                    selectedCategory === "All" && "bg-white text-black hover:bg-white hover:text-black"
                                )}
                                onClick={() => handleCategoryChange("All")}
                            >
                                All
                            </Button>
                            {categories.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={selectedCategory === category.name ? "default" : "outline"}
                                    className={cn(
                                        "rounded-full",
                                        selectedCategory === category.name && "bg-white text-black hover:bg-white hover:text-black"
                                    )}
                                    onClick={() => handleCategoryChange(category.name)}
                                >
                                    {category.name}
                                </Button>
                            ))}
                        </div>

                        {/* Difficulty Filter Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Difficulty:</span>
                            <Select value={selectedDifficulty} onValueChange={handleDifficultyChange}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {difficulties.map((difficulty) => (
                                        <SelectItem key={difficulty} value={difficulty}>
                                            {difficulty}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedCategory !== "All" || selectedDifficulty !== "All" || searchQuery) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Active filters:</span>
                            {selectedCategory !== "All" && (
                                <Badge variant="secondary" className="text-xs">
                                    Category: {selectedCategory}
                                </Badge>
                            )}
                            {selectedDifficulty !== "All" && (
                                <Badge variant="secondary" className="text-xs">
                                    Difficulty: {selectedDifficulty}
                                </Badge>
                            )}
                            {searchQuery && (
                                <Badge variant="secondary" className="text-xs">
                                    Search: "{searchQuery}"
                                </Badge>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedCategory("All");
                                    setSelectedDifficulty("All");
                                    setSearchQuery("");
                                    setCurrentPage(1);
                                }}
                                className="text-xs h-6 px-2"
                            >
                                Clear all
                            </Button>
                        </div>
                    )}



                    {/* Problems List */}
                    <div className="flex flex-col gap-2">
                        {/* Results Count */}
                        {!isLoading && problems.length > 0 && (
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>
                                    Showing {problems.length} problem{problems.length !== 1 ? 's' : ''}
                                    {totalPages > 1 && ` (page ${currentPage} of ${totalPages})`}
                                </span>
                                {totalPages > 1 && (
                                    <span>
                                        Total: {totalPages * 10} problems
                                    </span>
                                )}
                            </div>
                        )}
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : problems.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <Search className="h-16 w-16 mx-auto opacity-50" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">
                                    No problems found
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {searchQuery || selectedCategory !== "All" || selectedDifficulty !== "All"
                                        ? "Try adjusting your search criteria or filters."
                                        : "There are no problems available at the moment."
                                    }
                                </p>
                                {(searchQuery || selectedCategory !== "All" || selectedDifficulty !== "All") && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedCategory("All");
                                            setSelectedDifficulty("All");
                                            setSearchQuery("");
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Clear all filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            problems.map((problem, index) => (
                                <Link
                                    href={`/problems/${problem.id}`}
                                    key={problem.id}
                                    className={cn(
                                        "flex flex-row justify-between gap-2 px-10 py-3 rounded-md hover:bg-primary/5 transition-colors",
                                        index % 2 === 0 && "bg-primary/10"
                                    )}
                                >
                                    <div className="flex flex-row gap-4 items-center">
                                        <p className="text-sm font-medium">{index + 1}</p>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-medium">{problem.title}</p>
                                            <div className="flex gap-2">
                                                {problem.categories.map((cat) => (
                                                    <Badge
                                                        key={cat.id}
                                                        variant="secondary"
                                                        style={{ backgroundColor: cat.color + '20', color: cat.color }}
                                                    >
                                                        {cat.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-5 items-center">
                                        <p className="text-sm text-gray-500">
                                            {problem.timeLimit}ms / {problem.memoryLimit}MB
                                        </p>
                                        <p className={cn(
                                            "text-sm font-medium",
                                            isDifficultyMatch(problem.difficulty, "Easy") && "text-green-500",
                                            isDifficultyMatch(problem.difficulty, "Medium") && "text-yellow-500",
                                            isDifficultyMatch(problem.difficulty, "Hard") && "text-red-500"
                                        )}>
                                            {problem.difficulty}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center mt-6">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>

                                {/* Page numbers */}
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                size="sm"
                                                className="w-8 h-8 p-0"
                                                onClick={() => handlePageChange(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
