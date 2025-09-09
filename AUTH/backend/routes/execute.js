import express from 'express';
import executeCode from '../utils/executeCode.js'; // Your existing code execution utility
import auth from '../middleware/auth.js'; // We can still protect this route

const router = express.Router();

// POST /api/execute
// This route takes code, language, and custom input, then executes it.
router.post('/', auth, async (req, res) => {
    const { language, code, input } = req.body;

    if (!language || !code) {
        return res.status(400).json({ message: "Language and code are required." });
    }

    try {
        const output = await executeCode(language, code, input || ''); // Use provided input or an empty string
        res.json({ output }); // Send the raw output back
    } catch (error) {
        // The executeCode utility should handle errors, but we catch them just in case
        console.error("Execution error:", error);
        res.status(500).json({ message: "An error occurred while running the code.", error: error.message });
    }
});

export default router;
