import { db } from "@/db";
import { problem, session, submission, user } from "@/db/schema";
import { count, eq, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Get total problems
        const totalProblemsResult = await db.select({ count: count() }).from(problem);
        const totalProblems = totalProblemsResult[0]?.count || 0;

        // Get total users
        const totalUsersResult = await db.select({ count: count() }).from(user);
        const totalUsers = totalUsersResult[0]?.count || 0;

        // Get active users (unique users with sessions in the last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsersResult = await db
            .select({ userId: session.userId })
            .from(session)
            .where(gte(session.updatedAt, thirtyDaysAgo))
            .groupBy(session.userId);

        const activeUsers = activeUsersResult.length;

        // Get total submissions
        const totalSubmissionsResult = await db.select({ count: count() }).from(submission);
        const totalSubmissions = totalSubmissionsResult[0]?.count || 0;

        // Get successful submissions (Accepted verdicts)
        const successfulSubmissionsResult = await db
            .select({ count: count() })
            .from(submission)
            .where(eq(submission.verdict, "Accepted"));
        const successfulSubmissions = successfulSubmissionsResult[0]?.count || 0;

        // Get recent submissions (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentSubmissionsResult = await db
            .select({ count: count() })
            .from(submission)
            .where(gte(submission.createdAt, sevenDaysAgo));
        const recentSubmissions = recentSubmissionsResult[0]?.count || 0;

        // Calculate success rate
        const successRate = totalSubmissions > 0
            ? Math.round((successfulSubmissions / totalSubmissions) * 100)
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                totalProblems: totalProblems,
                totalUsers: totalUsers,
                activeUsers: activeUsers,
                totalSubmissions: totalSubmissions,
                recentSubmissions: recentSubmissions,
                successRate: successRate
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch statistics" },
            { status: 500 }
        );
    }
}
