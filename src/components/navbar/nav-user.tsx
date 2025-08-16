import {
    BadgeCheck,
    Bell,
    LogOut,
    User
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";

interface NavUserProps {
    name: string;
    email: string;
    avatar: string;
    onLogout: () => void;
}

interface NavigationMenuItem {
    label: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
}



export function NavUser({ name, email, avatar, onLogout }: NavUserProps) {

    const navItems: NavigationMenuItem[] = [
        {
            label: "Account",
            icon: <User />,
            href: "/account"
        },
        {
            label: "Admin Panel",
            icon: <Bell />,
            href: "/admin"
        },
        {
            label: "Logout",
            icon: <LogOut />,
            onClick: onLogout
        }
    ]


    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer">
                <Avatar className="size-10 rounded-full">
                    <AvatarImage className="rounded-full" src={avatar} alt={name} />
                    <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                {/* <ChevronsUpDown className="ml-auto size-4" /> */}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="right"
                align="start"
                sideOffset={4}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="size-8 rounded-full">
                            <AvatarImage src={avatar} alt={name} />
                            <AvatarFallback className="rounded-full">{name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{name}</span>
                            <span className="truncate text-xs">{email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {navItems.map((item) => (
                        <DropdownMenuItem
                            key={item.label}
                            onClick={item.onClick}
                            asChild
                        >
                            {item.href ? (
                                <Link href={item.href} className="flex items-center gap-2">
                                    {item.icon} {item.label}
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2 cursor-pointer" onClick={item.onClick}>
                                    {item.icon} {item.label}
                                </div>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
