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
import { cn, handleApiResponse, showErrorToast, showSuccessToast } from "@/lib/utils"
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
            const apiResponse = await handleApiResponse(response, 'Problems loaded successfully', 'Failed to load problems');

            if (apiResponse.success) {
                setProblems(apiResponse.data.problems);
                setCategories(apiResponse.data.categories);
                setTotalPages(apiResponse.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error loading problems:', error);
            showErrorToast('Failed to load problems');
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

    const onClickProblem = () => {
        showSuccessToast("Coming soon!")
    }

    return (
        <div className="flex flex-col container">
            <Navbar />
            <div className="mt-2 flex flex-col gap-6 md:gap-8 px-4 md:px-0 mb-10">
                {/* Carousel */}
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full z-0"
                >
                    <CarouselContent className="-ml-1">
                        {carouselItems.map((item, index) => (
                            <CarouselItem onClick={() => onClickProblem()} key={index} className="cursor-pointer pl-1 md:pl-2 basis-full sm:basis-1/2 lg:basis-1/3">
                                <Image
                                    src={item.image}
                                    alt="problem-card"
                                    width={320}
                                    height={135}
                                    className="rounded-lg w-full h-auto object-cover"
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="flex -left-4 md:-left-12" />
                    <CarouselNext className="flex -right-4 md:-right-12" />
                </Carousel>

                <div className="flex flex-col gap-4 md:gap-5">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search problems..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 text-sm md:text-base"
                        />
                    </div>

                    {/* Category and Difficulty Filters */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 md:pb-5 gap-4 sm:gap-0">
                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <Button
                                variant={selectedCategory === "All" ? "default" : "outline"}
                                className={cn(
                                    "rounded-full text-xs md:text-sm h-8 md:h-9",
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
                                        "rounded-full text-xs md:text-sm h-8 md:h-9",
                                        selectedCategory === category.name && "bg-white text-black hover:bg-white hover:text-black"
                                    )}
                                    onClick={() => handleCategoryChange(category.name)}
                                >
                                    {category.name}
                                </Button>
                            ))}
                        </div>

                        {/* Difficulty Filter Dropdown */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs md:text-sm text-muted-foreground">Difficulty:</span>
                            <Select value={selectedDifficulty} onValueChange={handleDifficultyChange}>
                                <SelectTrigger className="w-full sm:w-[120px] h-8 md:h-9 text-xs md:text-sm">
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
                        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
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
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs md:text-sm text-muted-foreground gap-2 sm:gap-0">
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
                                <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin" />
                            </div>
                        ) : problems.length === 0 ? (
                            <div className="text-center py-8 md:py-12 px-4">
                                <div className="text-gray-400 mb-4">
                                    <Search className="h-12 w-12 md:h-16 md:w-16 mx-auto opacity-50" />
                                </div>
                                <h3 className="text-base md:text-lg font-medium mb-2">
                                    No problems found
                                </h3>
                                <p className="text-sm md:text-base text-gray-500 mb-4">
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
                                        className="text-sm md:text-base"
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
                                        "flex flex-col sm:flex-row justify-between gap-3 px-4 md:px-10 py-3 rounded-md hover:bg-primary/5 transition-colors",
                                        index % 2 === 0 && "bg-primary/10"
                                    )}
                                >
                                    <div className="flex flex-col sm:flex-row gap-2 md:gap-4 items-start sm:items-center">
                                        <p className="text-xs md:text-sm font-medium text-muted-foreground">{index + 1}</p>
                                        <div className="flex flex-col gap-1 flex-1">
                                            <p className="text-sm md:text-base font-medium">{problem.title}</p>
                                            <div className="flex flex-wrap gap-1 md:gap-2">
                                                {problem.categories.map((cat) => (
                                                    <Badge
                                                        key={cat.id}
                                                        variant="secondary"
                                                        style={{ backgroundColor: cat.color + '20', color: cat.color }}
                                                        className="text-xs"
                                                    >
                                                        {cat.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 md:gap-5 items-start sm:items-center">
                                        <p className="text-xs text-gray-500">
                                            {problem.timeLimit}ms / {problem.memoryLimit}MB
                                        </p>
                                        <p className={cn(
                                            "text-xs font-medium",
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
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="text-xs md:text-sm h-8 md:h-9"
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
                                                className="w-7 h-7 md:w-8 md:h-8 p-0 text-xs md:text-sm"
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
                                    className="text-xs md:text-sm h-8 md:h-9"
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
