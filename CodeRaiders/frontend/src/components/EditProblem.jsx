//EditProblem.jsx (UPDATE): You can create a new component for editing, which pre-fills a form with the problem's data and calls the updateProblem function on submission.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProblemService from '../services/ProblemService';

const EditProblem = () => {
    const { problemId } = useParams(); // Get problem ID from the URL
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Easy'
    });
    const [testCases, setTestCases] = useState([]);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await ProblemService.getProblemById(problemId);
                const problem = response.data;
                setFormData({
                    title: problem.title,
                    description: problem.description,
                    difficulty: problem.difficulty,
                });
                setTestCases(problem.testCases);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching problem for editing:', error);
                alert('Failed to load problem for editing: ' + (error.response?.data?.message || error.message));
                setLoading(false);
            }
        };

        fetchProblem();
    }, [problemId]); // Re-run effect if the ID in the URL changes

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTestCaseChange = (index, e) => {
        const newTestCases = [...testCases];
        newTestCases[index][e.target.name] = e.target.value;
        setTestCases(newTestCases);
    };
    const addTestCase = () => {
        setTestCases([...testCases, { input: '', output: '' }]);
    };

    const removeTestCase = (index) => {
        const newTestCases = [...testCases];
        newTestCases.splice(index, 1);
        setTestCases(newTestCases);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const problemData = { ...formData, testCases };
            await ProblemService.updateProblem(problemId, problemData);
            alert('Problem updated successfully!');
            navigate('/problems'); // Redirect to the problem list
        } catch (error) {
            console.error('Error updating problem:', error.response?.data || error.message);
            alert('Failed to update problem: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) {
        return <p>Loading problem data...</p>;
    }

    return (
        <div>
            <h2>Edit Problem</h2>
            <form onSubmit={handleSubmit}>
                <h2>Edit Problem</h2>

                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Problem Title"
                    required
                />
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Problem Description"
                    required
                />
                <select name="difficulty" value={formData.difficulty} onChange={handleFormChange}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
                <h3>Test Cases</h3>
                {testCases.map((testCase, index) => (
                    <div key={index}>
                        <input type="text" name="input" value={testCase.input} onChange={(e) => handleTestCaseChange(index, e)} placeholder="Input" required />
                        <input type="text" name="output" value={testCase.output} onChange={(e) => handleTestCaseChange(index, e)} placeholder="Output" required />
                        <button type="button" onClick={() => removeTestCase(index)}>Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addTestCase}>Add Test Case</button>

                <button type="submit">Update Problem</button>
            </form>
        </div>
    );
};

export default EditProblem;