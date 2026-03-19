export default function ContestModerators() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Moderators</h1>
                    <p className="text-muted-foreground">
                        Manage contest moderators and permissions
                    </p>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    Add Moderator
                </button>
            </div>

            <div className="border rounded-lg">
                <div className="p-4 border-b">
                    <h3 className="font-semibold">Current Moderators (1)</h3>
                </div>
                <div className="p-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-sm font-medium">
                                AM
                            </div>
                            <div>
                                <h4 className="font-medium">Admin Moderator</h4>
                                <p className="text-sm text-muted-foreground">admin@example.com</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Full Access</span>
                            <button className="px-3 py-1 text-sm border rounded hover:bg-muted">Edit Permissions</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
