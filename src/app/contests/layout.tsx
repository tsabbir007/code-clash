import { Navbar } from "@/components/navbar/navbar";

export default function ContestLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col container">
            <Navbar />
            {children}
        </div>
    )
}