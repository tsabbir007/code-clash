import AdminSidebar, { AdminSidebarProps } from "../sidebar/admin-sidebar";

const AdminLayout = ({ children, dashboardItems }: { children: React.ReactNode, dashboardItems: AdminSidebarProps["dashboardItems"] }) => {

    return (
        <div className="grid grid-cols-4 gap-10">
            <div className="col-span-1 sticky top-0 h-screen">
                <AdminSidebar
                    dashboardTitle="Problem Dashboard"
                    dashboardItems={dashboardItems}
                />
            </div>
            <div className="col-span-3">
                {children}
            </div>
        </div>
    )
}

export default AdminLayout;


