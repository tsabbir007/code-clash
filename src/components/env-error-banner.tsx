"use client";

import { AlertTriangle, Database, Key, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface EnvErrorBannerProps {
    error?: string;
    details?: string;
    help?: string;
}

export function EnvErrorBanner({ error, details, help }: EnvErrorBannerProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <Alert className="border-destructive bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive">
                Configuration Error
            </AlertTitle>
            <AlertDescription className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    {error || "Some required configuration is missing"}
                </p>

                {details && (
                    <div className="text-xs text-muted-foreground">
                        <strong>Details:</strong> {details}
                    </div>
                )}

                {help && (
                    <div className="text-xs text-muted-foreground">
                        <strong>How to fix:</strong> {help}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-fit"
                    >
                        {isExpanded ? "Hide" : "Show"} Setup Instructions
                    </Button>

                    {isExpanded && (
                        <div className="rounded-md bg-muted p-3 text-xs">
                            <h4 className="font-semibold mb-2">Quick Setup:</h4>
                            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                                <li>Create a <code>.env.local</code> file in your project root</li>
                                <li>Add your database connection string:
                                    <br />
                                    <code className="block bg-background p-1 rounded mt-1">
                                        DATABASE_URL="postgresql://username:password@localhost:5432/database"
                                    </code>
                                </li>
                                <li>Add a secure secret key:
                                    <br />
                                    <code className="block bg-background p-1 rounded mt-1">
                                        AUTH_SECRET="your-secret-key-here"
                                    </code>
                                </li>
                                <li>Restart your development server</li>
                            </ol>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="w-fit"
                    >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh Page
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
    );
}
