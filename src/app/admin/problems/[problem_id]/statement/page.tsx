import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatementPage = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Statement</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[500px]">
                <SimpleEditor/>
            </CardContent>
        </Card>
    )
}

export default StatementPage;