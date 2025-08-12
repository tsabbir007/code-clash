import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { contest, contestProblem, problem, contestSubmission, contestParticipant, contestAnnouncement, user } from '@/db/schema';
import { eq, and, desc, count, sql, asc } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get the current session
        const session = await auth.api.getSession({ headers: request.headers });

        let currentUserId: string;

        if (session?.user?.id) {
            currentUserId = session.user.id;
        } else if (process.env.NODE_ENV === 'development') {
            // Temporary development mode: use a known user ID for testing
            // TODO: Remove this in production
            currentUserId = 'fF3V0hDrdt8xLCp7H7YUzZ5stbidQ0cq';
            console.log('Development mode: using test user ID:', currentUserId);
        } else {
            // For public access without authentication, we'll show limited data
            currentUserId = 'anonymous';
        }

        const { id: contestId } = await params;
        const contestIdNum = parseInt(contestId);

        if (isNaN(contestIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid contest ID' },
                { status: 400 }
            );
        }

        // Check if contest exists and is public
        const contestResult = await db
            .select()
            .from(contest)
            .where(eq(contest.id, contestIdNum))
            .limit(1);

        if (contestResult.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Contest not found' },
                { status: 404 }
            );
        }

        const contestData = contestResult[0];

        if (!contestData.isPublic) {
            return NextResponse.json(
                { success: false, error: 'Contest is not public' },
                { status: 403 }
            );
        }

        // Check if user is registered for the contest (only if authenticated)
        let isRegistered = false;
        if (currentUserId !== 'anonymous') {
            const registrationResult = await db
                .select()
                .from(contestParticipant)
                .where(and(
                    eq(contestParticipant.contestId, contestIdNum),
                    eq(contestParticipant.userId, currentUserId)
                ))
                .limit(1);

            isRegistered = registrationResult.length > 0;
        }

        // Fetch contest problems with problem details
        const problemsResult = await db
            .select({
                id: contestProblem.id,
                order: contestProblem.order,
                points: contestProblem.points,
                problemId: contestProblem.problemId,
                title: problem.title,
                statement: problem.statement,
                timeLimit: problem.timeLimit,
                memoryLimit: problem.memoryLimit,
            })
            .from(contestProblem)
            .innerJoin(problem, eq(contestProblem.problemId, problem.id))
            .where(eq(contestProblem.contestId, contestIdNum))
            .orderBy(contestProblem.order);

        // Fetch user's submissions for this contest (only if authenticated)
        let submissionsResult: any[] = [];
        if (currentUserId !== 'anonymous') {
            submissionsResult = await db
                .select({
                    id: contestSubmission.id,
                    problemId: contestSubmission.problemId,
                    language: contestSubmission.language,
                    verdict: contestSubmission.verdict,
                    score: contestSubmission.score,
                    submissionTime: contestSubmission.submissionTime,
                    cpuTime: contestSubmission.cpuTime,
                    memoryUsage: contestSubmission.memoryUsage,
                    linkedSubmissionId: contestSubmission.submissionId, // Add this field
                })
                .from(contestSubmission)
                .where(and(
                    eq(contestSubmission.contestId, contestIdNum),
                    eq(contestSubmission.userId, currentUserId)
                ))
                .orderBy(desc(contestSubmission.submissionTime));
        }

        // Fetch contest announcements
        const announcementsResult = await db
            .select({
                id: contestAnnouncement.id,
                title: contestAnnouncement.title,
                content: contestAnnouncement.content,
                isImportant: contestAnnouncement.isImportant,
                createdAt: contestAnnouncement.createdAt,
            })
            .from(contestAnnouncement)
            .where(eq(contestAnnouncement.contestId, contestIdNum))
            .orderBy(desc(contestAnnouncement.createdAt));

        // Calculate total points
        const totalPoints = problemsResult.reduce((sum, p) => sum + (p.points || 0), 0);

        // Calculate solved problems count for current user
        const solvedProblems = submissionsResult.filter(sub =>
            (sub.verdict === 'Accepted' || sub.verdict === 'AC') && sub.verdict !== 'Pending'
        ).length;

        // Calculate remaining time
        const now = new Date();
        const endTime = new Date(contestData.endTime);
        const remainingTime = Math.max(0, endTime.getTime() - now.getTime());

        // Calculate standings
        const standingsResult = await calculateContestStandings(contestIdNum, problemsResult);

        const contestFullData = {
            id: contestData.id,
            title: contestData.title,
            description: contestData.description || '',
            startTime: contestData.startTime,
            endTime: contestData.endTime,
            problems: problemsResult,
            submissions: submissionsResult,
            standings: standingsResult,
            announcements: announcementsResult,
            totalPoints,
            solvedProblems,
            remainingTime,
            isRegistered,
        };

        return NextResponse.json({
            success: true,
            data: contestFullData
        });

    } catch (error) {
        console.error('Error fetching full contest data:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch full contest data' },
            { status: 500 }
        );
    }
}

async function calculateContestStandings(contestId: number, problems: any[]) {
    try {
        // Get all participants for this contest
        const participantsResult = await db
            .select({
                userId: contestParticipant.userId,
            })
            .from(contestParticipant)
            .where(eq(contestParticipant.contestId, contestId));

        const standings: any[] = [];

        for (const participant of participantsResult) {
            // Get user details
            const userResult = await db
                .select({
                    name: user.name,
                })
                .from(user)
                .where(eq(user.id, participant.userId))
                .limit(1);

            if (userResult.length === 0) continue;

            const userName = userResult[0].name;

            // Get all submissions for this user in this contest
            const userSubmissions = await db
                .select({
                    problemId: contestSubmission.problemId,
                    verdict: contestSubmission.verdict,
                    score: contestSubmission.score,
                    submissionTime: contestSubmission.submissionTime,
                })
                .from(contestSubmission)
                .where(and(
                    eq(contestSubmission.contestId, contestId),
                    eq(contestSubmission.userId, participant.userId)
                ))
                .orderBy(asc(contestSubmission.submissionTime));

            // Calculate problem results
            const problemResults = problems.map(problem => {
                const problemSubmissions = userSubmissions.filter(sub => sub.problemId === problem.problemId);
                const isSolved = problemSubmissions.some(sub =>
                    (sub.verdict === 'Accepted' || sub.verdict === 'AC') && sub.verdict !== 'Pending'
                );
                const attempts = problemSubmissions.length;
                const bestScore = problemSubmissions.length > 0 ? Math.max(...problemSubmissions.map(s => s.score)) : 0;
                const firstSolveTime = isSolved ?
                    problemSubmissions.find(s => (s.verdict === 'Accepted' || s.verdict === 'AC') && s.verdict !== 'Pending')?.submissionTime : undefined;

                return {
                    problemId: problem.problemId,
                    score: bestScore,
                    attempts,
                    isSolved,
                    firstSolveTime,
                };
            });

            // Calculate total score and solved problems
            const totalScore = problemResults.reduce((sum, pr) => sum + pr.score, 0);
            const problemsSolved = problemResults.filter(pr => pr.isSolved).length;

            // Calculate penalty (simplified - just count attempts for unsolved problems)
            const penalty = problemResults.reduce((sum, pr) => {
                if (!pr.isSolved && pr.attempts > 0) {
                    return sum + (pr.attempts - 1) * 20; // 20 penalty points per wrong attempt
                }
                return sum;
            }, 0);

            // Get last submission time
            const lastSubmissionTime = userSubmissions.length > 0 ?
                userSubmissions[userSubmissions.length - 1].submissionTime : new Date().toISOString();

            standings.push({
                userId: participant.userId,
                userName,
                totalScore,
                problemsSolved,
                penalty,
                lastSubmissionTime,
                problemResults,
            });
        }

        // Sort standings by score (descending), then by penalty (ascending), then by last submission time
        standings.sort((a, b) => {
            if (a.totalScore !== b.totalScore) {
                return b.totalScore - a.totalScore;
            }
            if (a.penalty !== b.penalty) {
                return a.penalty - b.penalty;
            }
            return new Date(a.lastSubmissionTime).getTime() - new Date(b.lastSubmissionTime).getTime();
        });

        // Add rank
        standings.forEach((standing, index) => {
            standing.rank = index + 1;
        });

        return standings;

    } catch (error) {
        console.error('Error calculating standings:', error);
        return [];
    }
}
