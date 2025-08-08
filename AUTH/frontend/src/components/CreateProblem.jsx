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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await ProblemService.createProblem(formData);
            alert('Problem created successfully!');
            navigate('/problems'); // Redirect to the problem list
        } catch (error) {
            console.error('Error creating problem:', error.response?.data || error.message);
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
                <button type="submit">Create Problem</button>
            </form>
        </div>
    );
};

export default CreateProblem;