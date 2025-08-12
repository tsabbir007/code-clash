"use client";

import {
    LayoutDashboard,
    Settings,
    FileText,
    MessageSquare,
    Megaphone,
    Users,
    Wrench,
    Trophy,
    Shield
} from "lucide-react";

import AdminLayout from "../components/layout/admin-layout";
import { useContestStats } from "@/hooks/use-contest-stats";

const ContestsLayout = ({ children }: { children: React.ReactNode }) => {
    // For demo purposes, using a default contest ID
    // In a real app, this would come from the current contest context
    const { stats } = useContestStats("1");

    const dashboardItems = [
        {
            icon: <LayoutDashboard className="w-4 h-4" />,
            name: "Overview",
            href: "/admin/contests/overview",
        },
        {
            icon: <Settings className="w-4 h-4" />,
            name: "Settings",
            href: "/admin/contests/settings",
        },
        {
            icon: <FileText className="w-4 h-4" />,
            name: "Problems",
            href: "/admin/contests/problems",
            badge: stats.problems,
        },
        {
            icon: <MessageSquare className="w-4 h-4" />,
            name: "Clearifications",
            href: "/admin/contests/clearifications",
            badge: stats.clarifications,
        },
        {
            icon: <Megaphone className="w-4 h-4" />,
            name: "Announcements",
            href: "/admin/contests/announcements",
            badge: stats.announcements,
        },
        {
            icon: <Users className="w-4 h-4" />,
            name: "Participants",
            href: "/admin/contests/participants",
            badge: stats.participants,
        },
        {
            icon: <Wrench className="w-4 h-4" />,
            name: "Submissions",
            href: "/admin/contests/submissions",
            badge: stats.submissions,
        },
        {
            icon: <Trophy className="w-4 h-4" />,
            name: "Standings",
            href: "/admin/contests/standings",
        },
        {
            icon: <Shield className="w-4 h-4" />,
            name: "Moderators",
            href: "/admin/contests/moderators",
            badge: stats.moderators,
        }
    ]
    return (
        <AdminLayout dashboardItems={dashboardItems}>
            {children}
        </AdminLayout>
    )
}

export default ContestsLayout;