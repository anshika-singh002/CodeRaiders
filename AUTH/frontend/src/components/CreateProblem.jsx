//CreateProblem.jsx (CREATE): This component will have a form for a user to input a title, description, and difficulty. When the form is submitted, it will call the createProblem function from your service.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProblemService from '../services/ProblemService';

const CreateProblem = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Easy'
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [testCases, setTestCases] = useState([{ input: '', output: '' }]); // 👈 NEW STATE FOR TEST CASES

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
            // 👈 CORRECTED: Combine formData and testCases into a single object
            const problemData = { ...formData, testCases };


            await ProblemService.createProblem(problemData);
            alert('Problem created successfully!');
            navigate('/problems');
        } catch (error) {
            console.error('Error creating problem:', error.response?.data || error.message);
            // Handle authentication errors
            if (error.response?.status === 401) {
                alert('Your session has expired. Please login again.');
                localStorage.clear(); // Clear expired token
                navigate('/login'); // Redirect to login
                return;
            }
            alert('Failed to create problem: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div>
            <h2>Create New Problem</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Problem Title"
                    required
                />
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Problem Description"
                    required
                />
                <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>




                <h3>Test Cases</h3>

                {testCases.map((testCase, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            name="input"
                            value={testCase.input}
                            onChange={(e) => handleTestCaseChange(index, e)}
                            placeholder="Input"
                            required

                        />
                        <input
                            type="text"
                            name="output"
                            value={testCase.output}
                            onChange={(e) => handleTestCaseChange(index, e)}
                            placeholder="Output"
                            required
                        />
                        <button type="button" onClick={() => removeTestCase(index)}>
                            Remove
                        </button>
                    </div>
                ))}
                <button type="button" onClick={addTestCase}>
                    Add Test Case
                </button>
                <button type="submit">Create Problem</button>
            </form>
        </div>
    );
};

export default CreateProblem;