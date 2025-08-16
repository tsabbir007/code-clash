import { db } from '@/db';
import { contest, contestParticipant, contestProblem, problem, contestSubmission, user } from '@/db/schema';
import { count, eq, and, asc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ contestId: string }> }
) {
    try {
        const { contestId } = await params;
        const contestIdNum = parseInt(contestId);

        if (isNaN(contestIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid contest ID' },
                { status: 400 }
            );
        }

        // Check if contest exists and is public
        const contestResult = await db
            .select({
                id: contest.id,
                title: contest.title,
                description: contest.description,
                startTime: contest.startTime,
                endTime: contest.endTime,
                isPublic: contest.isPublic,
                createdAt: contest.createdAt,
                createdBy: contest.createdBy,
            })
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

        // Count participants
        const participantCountResult = await db
            .select({ count: count() })
            .from(contestParticipant)
            .where(eq(contestParticipant.contestId, contestIdNum));

        const participants = participantCountResult[0]?.count || 0;

        // Fetch contest problems
        const problemsResult = await db
            .select({
                id: contestProblem.id,
                order: contestProblem.order,
                points: contestProblem.points,
                problemId: contestProblem.problemId,
                title: problem.title,
                timeLimit: problem.timeLimit,
                memoryLimit: problem.memoryLimit,
            })
            .from(contestProblem)
            .innerJoin(problem, eq(contestProblem.problemId, problem.id))
            .where(eq(contestProblem.contestId, contestIdNum))
            .orderBy(contestProblem.order);

        // Calculate total points
        const totalPoints = problemsResult.reduce((sum: number, p: { points: number }) => sum + (p.points || 0), 0);

        // Calculate standings
        const standings = await calculateContestStandings(contestIdNum, problemsResult, contestData.startTime);

        const contestInfoData = {
            id: contestData.id,
            title: contestData.title,
            description: contestData.description || '',
            startTime: contestData.startTime,
            endTime: contestData.endTime,
            isPublic: contestData.isPublic,
            problems: problemsResult,
            participants,
            totalPoints,
            standings,
        };

        return NextResponse.json({
            success: true,
            data: contestInfoData
        });

    } catch (error) {
        console.error('Error fetching contest info:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch contest info' },
            { status: 500 }
        );
    }
}


async function calculateContestStandings(contestId: number, problems: any[], contestStartTime: Date) {
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

            // Skip users who haven't submitted anything
            if (userSubmissions.length === 0) continue;

            // Calculate problem results
            //TODO: Fix this
            const problemResults = problems.map(problem => {
                const problemSubmissions = userSubmissions.filter((sub: any) => sub.problemId === problem.problemId);
                const isSolved = problemSubmissions.some((sub: any) =>
                    (sub.verdict === 'Accepted' || sub.verdict === 'AC')
                );
                const attempts = problemSubmissions.length;
                const bestScore = problemSubmissions.length > 0 ? Math.max(...problemSubmissions.map((s: any) => s.score || 0)) : 0;
                const firstSolveTime = isSolved ?
                    problemSubmissions.find((s: any) => (s.verdict === 'Accepted' || s.verdict === 'AC'))?.submissionTime : undefined;

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

            // Calculate penalty: wrong attempts from first submission to first acceptance + time penalty
            // Penalty = (wrong attempts until first accept × 20) + (solve time - start time in minutes)
            const penalty = problemResults.reduce((sum, pr) => {
                let problemPenalty = 0;

                if (pr.isSolved && pr.firstSolveTime) {
                    // For solved problems, count wrong attempts only until first acceptance
                    const problemSubmissions = userSubmissions.filter((sub: any) => sub.problemId === pr.problemId);

                    // Find submissions before and including the first accepted submission
                    const firstAcceptedIndex = problemSubmissions.findIndex((sub: any) => sub.verdict === 'Accepted' || sub.verdict === 'AC');
                    if (firstAcceptedIndex !== -1) {
                        // Count wrong attempts from first submission to first acceptance (exclusive)
                        const wrongAttemptsUntilAccept = firstAcceptedIndex;
                        problemPenalty += wrongAttemptsUntilAccept * 20;

                        console.log(`Problem ${pr.problemId}: ${wrongAttemptsUntilAccept} wrong attempts until first accept`);
                    }

                    // Add time penalty (minutes from contest start to solve time)
                    try {
                        const contestStartTimeMs = new Date(contestStartTime).getTime();
                        const solveTime = new Date(pr.firstSolveTime).getTime();


                        if (contestStartTimeMs && solveTime && !isNaN(contestStartTimeMs) && !isNaN(solveTime)) {
                            const minutesFromStart = Math.floor((solveTime - contestStartTimeMs) / (1000 * 60));
                            problemPenalty += minutesFromStart;
                        } else {
                            console.log('Invalid date conversion');
                        }
                    } catch (error) {
                        console.error('Error calculating time penalty:', error);
                    }
                } else if (pr.attempts > 0) {
                    // For unsolved problems, all attempts are wrong
                    problemPenalty += pr.attempts * 20;
                }

                if (pr.isSolved) {
                    return sum + problemPenalty;
                }

                return 0;
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