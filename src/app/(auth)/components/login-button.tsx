import { NavUser } from "@/components/navbar/nav-user";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

interface LoginButtonProps {
    label: string;
    href: string;
}

const LoginButton = () => {
    const { data: session } = authClient.useSession()


    if (session) {
        return (
            <div className="flex items-center gap-2">
                <NavUser
                    name={session.user?.name || ""}
                    email={session.user?.email || ""}
                    avatar={session.user?.image || ""}
                    onLogout={() => authClient.signOut()}
                />
            </div>
        )
    }


    const items: LoginButtonProps[] = [
        {
            label: "Register",
            href: "/register"
        },
        {
            label: "Login",
            href: "/login"
        }
    ]

    return (
        <div className="flex items-center gap-2">
            {items.map((item, index) => (
                <div key={item.label} className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href={item.href}>
                            {item.label}
                        </Link>
                    </Button>
                    {index < items.length - 1 && <span className="text-muted-foreground">or</span>}
                </div>
            ))}

        </div>
    )
}

export default LoginButton;