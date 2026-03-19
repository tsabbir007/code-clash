export default function ContestAnnouncements() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Announcements</h1>
                    <p className="text-muted-foreground">
                        Manage contest announcements and notifications
                    </p>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    New Announcement
                </button>
            </div>

            <div className="border rounded-lg">
                <div className="p-4 border-b">
                    <h3 className="font-semibold">Announcements (0)</h3>
                </div>
                <div className="p-8 text-center text-muted-foreground">
                    <p>No announcements yet</p>
                    <p className="text-sm">Create your first announcement to keep participants informed</p>
                </div>
            </div>
        </div>
    );
}
