"use client"

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Navbar } from "@/components/navbar/navbar"
import { CustomPagination } from "@/components/contest/constest-list"

interface carouselItem {
    image: string;
    url: string;
}

enum Difficulty {
    EASY = "Easy",
    MEDIUM = "Medium",
    HARD = "Hard",
}

interface problem {
    title: string;
    difficulty: Difficulty;
    acceptance: number;
    url: string;
}

export default function ProblemSet() {

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

    const categories: string[] = [
        "All",
        "Algorithms",
        "Data Structures",
        "Math",
        "Database",
        "Shell"
    ]


    const problems: problem[] = [
        {
            title: "Two Sum",
            difficulty: Difficulty.EASY,
            acceptance: 0.45,
            url: "/problemset/two-sum",
        },
        {
            title: "Add Two Numbers",
            difficulty: Difficulty.MEDIUM,
            acceptance: 0.59,
            url: "/problemset/add-two-numbers",
        },
        {
            title: "Longest Substring Without Repeating Characters",
            difficulty: Difficulty.HARD,
            acceptance: 0.37,
            url: "/problemset/longest-substring-without-repeating-characters",
        },
        {
            title: "Longest Palindromic Substring",
            difficulty: Difficulty.HARD,
            acceptance: 0.45,
            url: "/problemset/longest-palindromic-substring",
        },
        {
            title: "Median of Two Sorted Arrays",
            difficulty: Difficulty.HARD,
            acceptance: 0.67,
            url: "/problemset/median-of-two-sorted-arrays",
        },
        {
            title: "Reverse Integer",
            difficulty: Difficulty.EASY,
            acceptance: 0.5,
            url: "/problemset/reverse-integer",
        },
        {
            title: "Palindrome Number",
            difficulty: Difficulty.EASY,
            acceptance: 0.59,
            url: "/problemset/palindrome-number",
        },
    ]

    const [selectedCategory, setSelectedCategory] = useState<string>("All");


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

            <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-4 border-b pb-5">
                    {categories.map((category, index) => (
                        <div key={index} className="flex flex-row gap-2">
                            <Button
                                variant={selectedCategory === category ? "default" : "outline"}
                                className={cn(
                                    "rounded-full",
                                    selectedCategory === category && "bg-white text-black hover:bg-white hover:text-black"
                                )}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </Button>
                        </div>
                    ))}
                </div>
                <div>
                    {problems.map((problem, index) => (
                        <Link href={problem.url} key={index} className={cn(
                            "flex flex-row justify-between gap-2 px-10 py-3 rounded-md",
                            index % 2 === 0 && "bg-primary/10"
                        )}>
                            <div className="flex flex-row gap-2">
                                <p className="text-sm font-medium">{index + 1}</p>
                                <p className="text-sm font-medium">{problem.title}</p>
                            </div>
                            <div className="flex flex-row gap-5">
                                <p className="text-sm text-gray-500">{problem.acceptance * 100}%</p>
                                <p className={
                                    cn(
                                        "text-sm",
                                        problem.difficulty === Difficulty.EASY && "text-green-500",
                                        problem.difficulty === Difficulty.MEDIUM && "text-yellow-500",
                                        problem.difficulty === Difficulty.HARD && "text-red-500"
                                    )}>
                                    {problem.difficulty}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="my-5">
                    <CustomPagination />
                </div>
            </div>
            </div>
        </div>

    )
}
