import { Clock, Construction } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ComingSoonProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
}

export function ComingSoon({
    title = "Coming Soon",
    description = "This feature is currently under development and will be available soon.",
    icon = <Construction className="h-16 w-16 text-muted-foreground" />
}: ComingSoonProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    {icon}
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        {description}
                    </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Stay tuned for updates</span>
                </div>
            </div>
        </div>
    );
}
