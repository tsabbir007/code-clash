import {
    LayoutDashboard,
    Eye,
    FileText,
    TestTube,
    Timer,
    Users,
    CheckSquare,
    Code,
    Upload
} from "lucide-react";

import AdminLayout from "../components/layout/admin-layout";

const ContestsLayout = ({ children }: { children: React.ReactNode }) => {
    const dashboardItems = [
        {
            icon: <LayoutDashboard className="w-4 h-4" />,
            name: "Overview",
            href: "/overview",
        },
        {
            icon: <Eye className="w-4 h-4" />,
            name: "Preview Problems",
            href: "/preview-problems",
        },
        {
            icon: <FileText className="w-4 h-4" />,
            name: "Statements",
            href: "/statements",
        },
        {
            icon: <TestTube className="w-4 h-4" />,
            name: "Test Cases",
            href: "/test-cases",
        },
        {
            icon: <Timer className="w-4 h-4" />,
            name: "Limits",
            href: "/limits",
        },
        {
            icon: <Users className="w-4 h-4" />,
            name: "Moderators",
            href: "/moderators",
        },
        {
            icon: <CheckSquare className="w-4 h-4" />,
            name: "Checkers & Validators",
            href: "/checkers",
        },
        {
            icon: <Code className="w-4 h-4" />,
            name: "Solutions",
            href: "/solutions",
        },
        {
            icon: <Upload className="w-4 h-4" />,
            name: "Submissions",
            href: "/submissions",
        }
    ]
    return (
        <AdminLayout dashboardItems={dashboardItems}>
            {children}
        </AdminLayout>
    )
}

export default ContestsLayout;