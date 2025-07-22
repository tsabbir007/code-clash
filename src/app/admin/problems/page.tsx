import { Button } from "@/components/ui/button";
import Link from "next/link";

const ProblemsPage = () => {
    const problemInfo = [
        {
            id: 1,
            name: "Problem 1",
            description: "Description 1",
        },
        {
            id: 2,
            name: "Problem 2",
            description: "Description 2",
        },
        {
            id: 3,
            name: "Problem 3",
            description: "Description 3",
        },
    ]
    return (
        <div className="flex flex-col gap-4">
            <Button>Add Problem</Button>
            <div className="flex flex-col gap-4">
                {problemInfo.map((problem) => (
                    <div key={problem.id}>
                        <h1>{problem.name}</h1>
                        <p>{problem.description}</p>
                        <Link href={`/admin/problems/${problem.id}/overview`}>
                            <Button>Edit</Button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProblemsPage;