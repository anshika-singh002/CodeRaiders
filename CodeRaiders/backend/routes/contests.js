import express from 'express';
import auth from '../middleware/auth.js';
import { Contest } from '../models/Contest.js';
import { Problem } from '../models/Problem.js';
import { ContestSubmission } from '../models/ContestSubmission.js';
import executeInDocker from '../utils/dockerExecutor.js';
import executeCode from '../utils/executeCode.js';

const router = express.Router();

// GET /api/contests - List all contests with calculated status
router.get('/', async (req, res) => {
    try {
        const contests = await Contest.find().sort({ startTime: -1 });
        const now = new Date();

        const formatted = contests.map((c) => {
            let status = 'Upcoming';
            if (now >= new Date(c.startTime) && now <= new Date(c.endTime)) {
                status = 'Live';
            } else if (now > new Date(c.endTime)) {
                status = 'Ended';
            }
            return {
                ...c.toObject(),
                status,
                participantsCount: c.participants ? c.participants.length : 0
            };
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/contests - Create a new contest (Admin)
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, startTime, endTime, problems } = req.body;
        const contest = await Contest.create({
            title,
            description,
            startTime,
            endTime,
            problems: problems || [],
            createdBy: req.user.id
        });
        res.status(201).json(contest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/contests/:id - Get contest details
router.get('/:id', async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id).populate('problems', 'title difficulty tags');
        if (!contest) return res.status(404).json({ message: 'Contest not found' });

        const now = new Date();
        let status = 'Upcoming';
        if (now >= new Date(contest.startTime) && now <= new Date(contest.endTime)) {
            status = 'Live';
        } else if (now > new Date(contest.endTime)) {
            status = 'Ended';
        }

        res.json({ ...contest.toObject(), status });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/contests/:id/join - Register/join a contest
router.post('/:id/join', auth, async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });

        const userId = req.user.id;

        // Check if already joined
        const alreadyJoined = contest.participants.some(p => p.toString() === userId.toString());
        if (alreadyJoined) {
            return res.status(200).json({ message: 'Already registered for this contest.' });
        }

        contest.participants.push(userId);
        await contest.save();

        res.status(200).json({ message: 'Successfully joined the contest.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/contests/:id/submit - Docker powered submission execution
router.post('/:id/submit', auth, async (req, res) => {
    try {
        const { problemId, language, code } = req.body;
        const contest = await Contest.findById(req.params.id);

        if (!contest) return res.status(404).json({ message: 'Contest not found' });

        const now = new Date();
        if (now < new Date(contest.startTime) || now > new Date(contest.endTime)) {
            return res.status(400).json({ message: 'Submissions are only allowed while contest is Live.' });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        const testCases = problem.testCases || [];
        let overallResult = 'Accepted';
        let totalExecutionTime = 0;
        let passedCases = 0;

        for (const tc of testCases) {
            const start = Date.now();
            let execResult;

            try {
                // Try Docker execution first
                execResult = await executeInDocker(language, code, tc.input);
            } catch (dockerErr) {
                // Fallback to local process if Docker is not active on host machine
                try {
                    const fallbackOut = await executeCode(language, code, tc.input);
                    execResult = { output: fallbackOut };
                } catch (fallbackErr) {
                    execResult = { error: fallbackErr.message };
                }
            }

            const elapsed = Date.now() - start;
            totalExecutionTime += elapsed;

            if (execResult.error) {
                if (execResult.error.includes('Time Limit')) {
                    overallResult = 'Time Limit Exceeded';
                } else {
                    overallResult = 'Runtime Error';
                }
                break;
            }

            const cleanActual = (execResult.output || '').trim();
            const cleanExpected = (tc.output || '').trim();

            if (cleanActual === cleanExpected) {
                passedCases++;
            } else {
                overallResult = 'Wrong Answer';
                break;
            }
        }

        const score = overallResult === 'Accepted' ? 100 : Math.round((passedCases / (testCases.length || 1)) * 50);

        const submission = await ContestSubmission.create({
            contestId: contest._id,
            userId: req.user.id,
            problemId,
            language,
            code,
            result: overallResult,
            executionTime: totalExecutionTime,
            score
        });

        // Register user as participant if not already present
        if (!contest.participants.includes(req.user.id)) {
            contest.participants.push(req.user.id);
            await contest.save();
        }

        res.status(201).json(submission);
    } catch (err) {
        console.error('Contest submission error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/contests/:id/leaderboard - Real-time leaderboard for contest
router.get('/:id/leaderboard', async (req, res) => {
    try {
        const submissions = await ContestSubmission.find({ contestId: req.params.id })
            .populate('userId', 'username email')
            .sort({ score: -1, createdAt: 1 });

        // Aggregate top score per user
        const leaderboardMap = new Map();
        for (const sub of submissions) {
            const uid = sub.userId?._id?.toString() || sub.userId;
            if (!leaderboardMap.has(uid)) {
                leaderboardMap.set(uid, {
                    user: sub.userId,
                    totalScore: sub.score,
                    submissionsCount: 1,
                    lastSubmittedAt: sub.createdAt
                });
            } else {
                const entry = leaderboardMap.get(uid);
                entry.totalScore = Math.max(entry.totalScore, sub.score);
                entry.submissionsCount += 1;
            }
        }

        const leaderboard = Array.from(leaderboardMap.values()).sort((a, b) => b.totalScore - a.totalScore);
        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
