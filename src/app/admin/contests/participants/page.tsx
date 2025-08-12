export default function ContestParticipants() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Participants</h1>
                    <p className="text-muted-foreground">
                        Manage contest participants and registrations
                    </p>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    Invite Participant
                </button>
            </div>

            <div className="border rounded-lg">
                <div className="p-4 border-b">
                    <h3 className="font-semibold">Registered Participants (1)</h3>
                </div>
                <div className="p-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                                JS
                            </div>
                            <div>
                                <h4 className="font-medium">John Smith</h4>
                                <p className="text-sm text-muted-foreground">john.smith@example.com</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
                            <button className="px-3 py-1 text-sm border rounded hover:bg-muted">View Details</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
