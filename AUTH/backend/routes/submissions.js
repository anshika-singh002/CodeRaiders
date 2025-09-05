import express from 'express';
import auth from '../middleware/auth.js';
import { Submission } from '../models/Submission.js';
import { Problem } from '../models/Problem.js';
import executeCode from '../utils/executeCode.js';



const router = express.Router();

const languageMap = {
    // 👈 CORRECT: Use string names, not IDs
    javascript: 'javascript',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
};

// GET: Fetch all submissions for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.user.id })
            .populate('problemId', 'title difficulty');
        res.status(200).json(submissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Internal server error fetching submissions.' });
    }
});

// POST: Create a new submission
router.post('/', auth, async (req, res) => {
    try {
        const { problemId, language, code } = req.body;
        const userId = req.user.id;

        const languageCode = languageMap[language];
        if (!languageCode) {
            return res.status(400).json({ message: `Unsupported language: ${language}` });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        
        // This is a simple implementation that only runs the first test case.
        const inputData = problem.testCases[0].input;
        const expectedOutput = problem.testCases[0].output.trim();

        // 👈 CORRECT: Actually call the executeCode utility
        const startTime = Date.now();
        const output = await executeCode(languageCode, code, inputData);
        const executionTime = Date.now() - startTime;
        
        let result = 'Wrong Answer';
        if (output.trim() === expectedOutput) {
            result = 'Accepted';
        }

        const newSubmission = await Submission.create({
            userId,
            problemId,
            language,
            code,
            result,
            output,
            executionTime
        });

        res.status(201).json(newSubmission);
    } catch (error) {
        console.error('Submission Error:', error);
        res.status(500).json({
            message: `Submission failed: ${error.message || 'Internal server error during submission.'}`
        });
    }
});

export default router;
