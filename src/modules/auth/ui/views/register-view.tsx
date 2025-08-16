"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email(),
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z.string().min(1, { message: "Confirm password is required" }),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
})


const RegisterView = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            authClient.signUp.email(
                {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                },
                {
                    onSuccess: () => {
                        setIsLoading(false);
                        showSuccessToast("Account created successfully!");
                        router.push("/");
                    },
                    onError: ({ error }) => {
                        setIsLoading(false);

                        // Debug: Log the error object to understand its structure
                        console.log('Register error object:', error);

                        // Handle different error object structures
                        let errorMessage = 'Unknown error occurred';

                        if (typeof error === 'string') {
                            errorMessage = error;
                        } else if (error && typeof error === 'object') {
                            errorMessage = error.message || error.error || error.toString();
                        } else if (error) {
                            errorMessage = String(error);
                        }

                        // Handle different types of errors
                        if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
                            showErrorToast("Server error occurred. Please check your database connection and try again.");
                        } else if (errorMessage.includes('User already exists')) {
                            showErrorToast("An account with this email already exists. Please login instead.");
                        } else if (errorMessage.includes('Invalid email')) {
                            showErrorToast("Please enter a valid email address.");
                        } else if (errorMessage.includes('Password too weak')) {
                            showErrorToast("Password is too weak. Please choose a stronger password.");
                        } else {
                            showErrorToast(errorMessage);
                        }
                    }
                }
            )
        } catch (error) {
            setIsLoading(false);
            console.error('Register error caught in try-catch:', error);
            showErrorToast("An unexpected error occurred. Please try again.");
        }
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                    Enter your details below to create an account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                required
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="email">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="m@example.com"
                                                required
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="password">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                required
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Link
                                href="/forgot-password"
                                className="ms-auto inline-block text-sm underline-offset-4 hover:underline"
                            >
                                Forgot your password?
                            </Link>
                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    className="w-full cursor-pointer"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Creating account..." : "Register"}
                                </Button>
                                <Button variant="outline" className="w-full cursor-pointer">
                                    Sign up with Google
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="underline underline-offset-4">
                                Login
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default RegisterView;