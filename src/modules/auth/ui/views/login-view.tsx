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
    email: z.string().email(),
    password: z.string().min(1, { message: "Password is required" }),
    ipAddress: z.string().optional(),
})


const LoginView = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            authClient.signIn.email(
                {
                    email: data.email,
                    password: data.password,
                },
                {
                    onSuccess: () => {
                        setIsLoading(false);
                        showSuccessToast("Successfully logged in!");
                        router.push("/");
                    },
                    onError: ({ error }) => {
                        setIsLoading(false);

                        // Debug: Log the error object to understand its structure
                        console.log('Login error object:', error);

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
                        } else if (errorMessage.includes('Invalid credentials')) {
                            showErrorToast("Invalid email or password. Please try again.");
                        } else if (errorMessage.includes('User not found')) {
                            showErrorToast("No account found with this email. Please register first.");
                        } else {
                            showErrorToast(errorMessage);
                        }
                    }
                }
            )
        } catch (error) {
            setIsLoading(false);
            console.error('Login error caught in try-catch:', error);
            showErrorToast("An unexpected error occurred. Please try again.");
        }
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
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

                            {/* <Link
                                href="/forgot-password"
                                className="ms-auto inline-block text-sm underline-offset-4 hover:underline"
                            >
                                Forgot your password?
                            </Link> */}
                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    className="w-full cursor-pointer text-muted-foreground"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Logging in..." : "Login"}
                                </Button>
                                <Button variant="outline" className="w-full cursor-pointer">
                                    Continue with Google
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="underline underline-offset-4">
                                Register
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default LoginView;