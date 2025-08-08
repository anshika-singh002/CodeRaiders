import express from 'express';
import { Problem } from '../models/Problem.js'; // Ensure Problem model is correctly imported
import auth from '../middleware/auth.js'; // Your auth middleware

const router = express.Router();

// CREATE: Add a new problem (protected route)
// Path changed from '/problems' to '/'
router.post('/', auth, async (req, res) => {
    try {
        const problem = new Problem({
            ...req.body,
            // CORRECTED: Access req.user.id
            author: req.user.id // Get the user id from the authenticated token
        });
        // CORRECTED: Call save() on the 'problem' instance, not the 'Problem' model
        await problem.save();
        res.status(201).send(problem);
    } catch (error) {
        // It's good practice to send a JSON response for errors
        console.error("Error creating problem:", error);
        res.status(400).json({ message: "Failed to create problem.", error: error.message });
    }
});

// READ: get all problems
// Path changed from '/problems' to '/'
router.get('/', async (req, res) => {
    try {
        const problems = await Problem.find({});
        res.status(200).send(problems);
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ message: "Internal server error fetching problems." });
    }
});

// READ: Get a single problem by ID
// Path changed from '/problems/:id' to '/:id'
router.get('/:id', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }
        res.status(200).send(problem);
    } catch (error) {
        console.error("Error fetching single problem:", error);
        res.status(500).json({ message: "Internal server error fetching problem." });
    }
});

// UPDATE: Update a problem by ID (Protected route)
// Path changed from '/problems/:id' to '/:id'
router.put('/:id', auth, async (req, res) => {
    try {
        const problem = await Problem.findOneAndUpdate(
            { _id: req.params.id, author: req.user.id }, // find by ID and author
            req.body,
            { new: true, runValidators: true } // return the updated document and run validation
        );
        if (!problem) {
            // This could mean problem not found OR user is not the author
            return res.status(404).json({ message: "Problem not found or you are not authorized to update it." });
        }
        res.status(200).send(problem);
    } catch (error) {
        console.error("Error updating problem:", error);
        res.status(400).json({ message: "Failed to update problem.", error: error.message });
    }
});

// DELETE: Delete a problem by ID (Protected route)
// Path changed from '/problems/:id' to '/:id'
router.delete('/:id', auth, async (req, res) => {
    try {
        const problem = await Problem.findOneAndDelete({ _id: req.params.id, author: req.user.id });
        if (!problem) {
            // This could mean problem not found OR user is not the author
            return res.status(404).json({ message: "Problem not found or you are not authorized to delete it." });
        }
        res.status(200).json({ message: 'Problem deleted successfully' });
    } catch (error) {
        console.error("Error deleting problem:", error);
        res.status(500).json({ message: "Internal server error deleting problem." });
    }
});

export default router;