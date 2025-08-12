"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardItem {
    name: string;
    href: string;
    icon?: React.ReactNode;
    badge?: number;
}

export interface AdminSidebarProps {
    dashboardTitle: string;
    dashboardItems: DashboardItem[];
}

const AdminSidebar = ({ dashboardTitle, dashboardItems }: AdminSidebarProps) => {
    const pathname = usePathname();

    return (
        <Card className="flex flex-col gap-4 border rounded-md">
            <CardHeader>
                <CardTitle className="text-lg font-bold">{dashboardTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
                {dashboardItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                        <div key={index} className="flex flex-col">
                            <Link
                                href={item.href}
                                className={`flex items-center justify-between gap-2 rounded p-3 transition-colors ${isActive
                                    ? "bg-muted font-medium"
                                    : "hover:bg-muted/50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span className="text-sm">{item.name}</span>
                                </div>
                                {item.badge !== undefined && (
                                    <Badge variant="secondary" className="ml-auto">
                                        {item.badge}
                                    </Badge>
                                )}
                            </Link>
                            {index !== dashboardItems.length - 1 && <Separator className="my-1" />}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    )
}

export default AdminSidebar;