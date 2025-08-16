"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <Toaster />
        </NextThemesProvider>
    )
}