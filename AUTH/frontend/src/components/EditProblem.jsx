//EditProblem.jsx (UPDATE): You can create a new component for editing, which pre-fills a form with the problem's data and calls the updateProblem function on submission.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProblemService from '../services/ProblemService';

const EditProblem = () => {
    const { id } = useParams(); // Gets the problem ID from the URL
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Easy'
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await ProblemService.getProblemById(id);
                setFormData(response.data); // Pre-fill the form with existing data
                setLoading(false);
            } catch (error) {
                console.error('Error fetching problem:', error);
                alert('Failed to load problem for editing.');
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id]); // Re-run effect if the ID in the URL changes

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await ProblemService.updateProblem(id, formData);
            alert('Problem updated successfully!');
            navigate('/problems'); // Redirect to the problem list after successful update
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
                <button type="submit">Update Problem</button>
            </form>
        </div>
    );
};

export default EditProblem;