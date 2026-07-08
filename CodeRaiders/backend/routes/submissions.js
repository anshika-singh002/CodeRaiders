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

const normalizeOutput = (value) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value
        .trim()
        .replace(/^output:\s*/i, '')
        .replace(/\s+/g, ' ')
        .trim();
};

// GET: Fetch all submissions for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.user.id })
            .populate('problemId', 'title difficulty')
            .sort({ createdAt: -1 });
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

        const sampleTestCases = (problem.testCases || []).slice(0, 2);
        if (sampleTestCases.length === 0) {
            return res.status(400).json({ message: 'Problem does not contain any test cases.' });
        }

        const startTime = Date.now();
        const testCaseResults = [];
        let result = 'Accepted';

        for (let index = 0; index < sampleTestCases.length; index += 1) {
            const testCase = sampleTestCases[index];

            try {
                const output = await executeCode(languageCode, code, testCase.input);
                const normalizedOutput = normalizeOutput(output);
                const expectedOutput = normalizeOutput(testCase.output);
                const passed = normalizedOutput === expectedOutput;

                testCaseResults.push({
                    caseNumber: index + 1,
                    input: testCase.input,
                    expectedOutput,
                    actualOutput: normalizedOutput,
                    passed
                });

                if (!passed) {
                    result = 'Wrong Answer';
                }
            } catch (executionError) {
                result = 'Runtime Error';
                testCaseResults.push({
                    caseNumber: index + 1,
                    input: testCase.input,
                    expectedOutput: testCase.output.trim(),
                    actualOutput: executionError.message,
                    passed: false,
                    error: executionError.message
                });
                break;
            }
        }

        const executionTime = Date.now() - startTime;
        const output = testCaseResults
            .map((item) => {
                if (item.error) {
                    return `Test Case ${item.caseNumber}: Runtime Error\n${item.error}`;
                }

                return [
                    `Test Case ${item.caseNumber}: ${item.passed ? 'Passed' : 'Failed'}`,
                    `Expected: ${item.expectedOutput}`,
                    `Actual: ${item.actualOutput}`
                ].join('\n');
            })
            .join('\n\n');

        const newSubmission = await Submission.create({
            userId,
            problemId,
            language,
            code,
            result,
            output,
            executionTime
        });

        res.status(201).json({
            ...newSubmission.toObject(),
            testCaseResults
        });
    } catch (error) {
        console.error('Submission Error:', error);
        res.status(500).json({
            message: `Submission failed: ${error.message || 'Internal server error during submission.'}`
        });
    }
});

export default router;
