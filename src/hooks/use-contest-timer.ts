import { useState, useEffect, useRef } from 'react';

interface ContestTimerProps {
    startTime: string;
    endTime: string;
    initialRemainingTime?: number;
}

interface ContestTimerState {
    remainingTime: number;
    isRunning: boolean;
    isContestStarted: boolean;
    isContestEnded: boolean;
    timeUntilStart: number;
}

export function useContestTimer({ startTime, endTime, initialRemainingTime }: ContestTimerProps) {
    const [timerState, setTimerState] = useState<ContestTimerState>({
        remainingTime: initialRemainingTime || 0,
        isRunning: false,
        isContestStarted: false,
        isContestEnded: false,
        timeUntilStart: 0,
    });

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const endTimeRef = useRef<number>(0);

    useEffect(() => {
        // Clear any existing intervals
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Validate that we have valid start and end times
        if (!startTime || !endTime || startTime === '' || endTime === '') {
            setTimerState({
                remainingTime: 0,
                isRunning: false,
                isContestStarted: false,
                isContestEnded: false,
                timeUntilStart: 0,
            });
            return;
        }

        try {
            const startTimeMs = new Date(startTime).getTime();
            const endTimeMs = new Date(endTime).getTime();

            // Check if dates are valid
            if (isNaN(startTimeMs) || isNaN(endTimeMs)) {
                console.error('Invalid date format:', { startTime, endTime });
                return;
            }

            startTimeRef.current = startTimeMs;
            endTimeRef.current = endTimeMs;

            const now = Date.now();

            // Calculate initial state
            const isStarted = now >= startTimeMs;
            const isEnded = now >= endTimeMs;
            const timeUntilStart = Math.max(0, startTimeMs - now);
            const remainingTime = isEnded ? 0 : Math.max(0, endTimeMs - now);

            setTimerState({
                remainingTime,
                isRunning: isStarted && !isEnded,
                isContestStarted: isStarted,
                isContestEnded: isEnded,
                timeUntilStart,
            });

            // Start the timer if contest is running
            if (isStarted && !isEnded) {
                startTimer();
            } else if (!isStarted) {
                // Start countdown to contest start
                startCountdownToStart();
            }
        } catch (error) {
            console.error('Error parsing contest times:', error);
            setTimerState({
                remainingTime: 0,
                isRunning: false,
                isContestStarted: false,
                isContestEnded: false,
                timeUntilStart: 0,
            });
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [startTime, endTime]);

    const startTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setTimerState(prev => {
                const now = Date.now();
                const newRemainingTime = Math.max(0, endTimeRef.current - now);

                if (newRemainingTime <= 0) {
                    // Contest ended
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }
                    return {
                        ...prev,
                        remainingTime: 0,
                        isRunning: false,
                        isContestEnded: true,
                    };
                }

                return {
                    ...prev,
                    remainingTime: newRemainingTime,
                };
            });
        }, 1000);
    };

    const startCountdownToStart = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setTimerState(prev => {
                const now = Date.now();
                const newTimeUntilStart = Math.max(0, startTimeRef.current - now);

                if (newTimeUntilStart <= 0) {
                    // Contest started
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }
                    startTimer();
                    return {
                        ...prev,
                        timeUntilStart: 0,
                        isContestStarted: true,
                        isRunning: true,
                    };
                }

                return {
                    ...prev,
                    timeUntilStart: newTimeUntilStart,
                };
            });
        }, 1000);
    };

    const formatTime = (milliseconds: number) => {
        // Handle invalid input
        if (!milliseconds || milliseconds < 0 || isNaN(milliseconds)) {
            return '00:00:00';
        }

        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getTimerDisplay = () => {
        if (timerState.isContestEnded) {
            return {
                text: 'Contest Ended',
                time: '00:00:00',
                color: 'text-red-600',
                status: 'ended',
            };
        }

        if (!timerState.isContestStarted) {
            return {
                text: 'Time Until Start',
                time: formatTime(timerState.timeUntilStart),
                color: 'text-blue-600',
                status: 'waiting',
            };
        }

        return {
            text: 'Time Remaining',
            time: formatTime(timerState.remainingTime),
            color: 'text-red-600',
            status: 'running',
        };
    };

    return {
        ...timerState,
        formatTime,
        getTimerDisplay,
    };
}
