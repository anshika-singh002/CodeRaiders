//CreateProblem.jsx (CREATE): This component will have a form for a user to input a title, description, and difficulty. When the form is submitted, it will call the createProblem function from your service.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProblemService from '../services/ProblemService';

const exampleProblem = {
    title: 'Two Sum',
    description: 'Given an array of integers and a target value, return the indices of the two numbers that add up to the target. Assume exactly one valid answer exists.',
    difficulty: 'Easy',
    tags: 'arrays, hash-map, basics',
    testCases: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
        { input: 'nums = [3,3], target = 6', output: '[0,1]' }
    ]
};

const CreateProblem = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        tags: ''
    });
    const [testCases, setTestCases] = useState([{ input: '', output: '' }]);
    const navigate = useNavigate();

    const handleChange = (e) => {
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

    const loadExampleProblem = () => {
        setFormData({
            title: exampleProblem.title,
            description: exampleProblem.description,
            difficulty: exampleProblem.difficulty,
            tags: exampleProblem.tags
        });
        setTestCases(exampleProblem.testCases);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const problemData = {
                ...formData,
                tags: formData.tags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(Boolean),
                testCases
            };

            await ProblemService.createProblem(problemData);
            alert('Problem created successfully!');
            navigate('/problems');
        } catch (error) {
            console.error('Error creating problem:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                alert('Your session has expired. Please login again.');
                localStorage.clear();
                navigate('/login');
                return;
            }
            alert('Failed to create problem: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 px-4 py-8 text-slate-100">
            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-slate-800 shadow-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 sm:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Admin workspace</p>
                            <h2 className="mt-2 text-3xl font-bold text-white">Create New Problem</h2>
                            <p className="mt-2 max-w-2xl text-sm text-blue-50/90">
                                Add a coding challenge, define test cases, and prepare a problem for the coding space.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={loadExampleProblem}
                            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                        >
                            Load Example Problem
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 px-6 py-8 sm:px-8">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2 md:col-span-2">
                            <span className="text-sm font-medium text-slate-300">Problem Title</span>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Problem Title"
                                required
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                            />
                        </label>

                        <label className="space-y-2 md:col-span-2">
                            <span className="text-sm font-medium text-slate-300">Problem Description</span>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Problem Description"
                                required
                                rows="6"
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                            />
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm font-medium text-slate-300">Difficulty</span>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm font-medium text-slate-300">Tags</span>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="arrays, hash-map, greedy"
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                            />
                        </label>
                    </div>

                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Test Cases</h3>
                            <button
                                type="button"
                                onClick={addTestCase}
                                className="rounded-lg border border-white/10 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-600"
                            >
                                Add Test Case
                            </button>
                        </div>

                        <div className="space-y-4">
                            {testCases.map((testCase, index) => (
                                <div key={index} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <input
                                            type="text"
                                            name="input"
                                            value={testCase.input}
                                            onChange={(e) => handleTestCaseChange(index, e)}
                                            placeholder="Input"
                                            required
                                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                                        />
                                        <input
                                            type="text"
                                            name="output"
                                            value={testCase.output}
                                            onChange={(e) => handleTestCaseChange(index, e)}
                                            placeholder="Output"
                                            required
                                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeTestCase(index)}
                                            className="rounded-lg bg-red-600/90 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={loadExampleProblem}
                            className="rounded-lg border border-white/10 bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-600 sm:hidden"
                        >
                            Load Example Problem
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            Create Problem
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProblem;