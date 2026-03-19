import { Navbar } from "@/components/navbar/navbar";

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className="flex min-h-[90dvh] items-center justify-center">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}

export default AuthLayout;