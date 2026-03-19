"use client";

import { Navbar } from "@/components/navbar/navbar";
import AdminSidebar, { AdminSidebarProps } from "../sidebar/admin-sidebar";
import { usePathname } from "next/navigation";

const AdminLayout = ({ children, dashboardItems }: { children: React.ReactNode, dashboardItems: AdminSidebarProps["dashboardItems"] }) => {
    const pathname = usePathname();

    // Determine dashboard title based on current route
    const getDashboardTitle = () => {
        if (pathname.includes('/admin/contests')) {
            return "Contest Dashboard";
        } else if (pathname.includes('/admin/problems')) {
            return "Problem Dashboard";
        }
        return "Admin Dashboard";
    };

    return (
        <div className="container mx-auto px-4 pb-8 min-h-screen bg-background">
            <Navbar />
            <div className="grid grid-cols-4 gap-10">
                <div className="col-span-1 sticky top-0 h-screen">
                    <AdminSidebar
                        dashboardTitle={getDashboardTitle()}
                        dashboardItems={dashboardItems}
                    />
                </div>
                <div className="col-span-3">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AdminLayout;


