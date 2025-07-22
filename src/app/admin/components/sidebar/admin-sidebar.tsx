import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface DashboardItem {
    name: string;
    href: string;
    icon?: React.ReactNode;
}

export interface AdminSidebarProps {
    dashboardTitle: string;
    dashboardItems: DashboardItem[];
}

const AdminSidebar = ({ dashboardTitle, dashboardItems }: AdminSidebarProps) => {
    return (
        <Card className="flex flex-col gap-4 border rounded-md">
            <CardHeader>
                <CardTitle className="text-lg font-bold">{dashboardTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
                {dashboardItems.map((item, index) => (
                    <div key={index} className="flex flex-col">
                        <Link href={item.href} className="flex items-center gap-2 hover:bg-muted rounded p-2">
                            {item.icon}
                            <span className="text-sm">{item.name}</span>
                        </Link>
                        {index !== dashboardItems.length - 1 && <Separator className="my-2" />}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export default AdminSidebar;