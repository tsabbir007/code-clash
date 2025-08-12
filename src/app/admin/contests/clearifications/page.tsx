export default function ContestClearifications() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Clearifications</h1>
                <p className="text-muted-foreground">
                    Manage participant questions and clarifications
                </p>
            </div>

            <div className="border rounded-lg">
                <div className="p-4 border-b">
                    <h3 className="font-semibold">Pending Questions (2)</h3>
                </div>
                <div className="p-4 space-y-4">
                    <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">Question about Problem A</h4>
                            <span className="text-xs text-muted-foreground">2 hours ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            "Can you clarify the input format for the second test case?"
                        </p>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
                                Answer
                            </button>
                            <button className="px-3 py-1 text-sm border rounded hover:bg-muted">
                                Dismiss
                            </button>
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">Time limit clarification</h4>
                            <span className="text-xs text-muted-foreground">1 hour ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            "Is the time limit per test case or for the entire problem?"
                        </p>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
                                Answer
                            </button>
                            <button className="px-3 py-1 text-sm border rounded hover:bg-muted">
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
