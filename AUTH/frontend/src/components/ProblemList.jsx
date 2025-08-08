//(READ & DELETE): This component will fetch all problems when it loads and display them in a list. It will also contain buttons to delete or edit a problem by calling the ProblemService.

import React, { useState, useEffect } from 'react';
import ProblemService from '../services/ProblemService';

const ProblemList = () => {
    const [problems, setProblems] = useState([]);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await ProblemService.getAllProblems();
                setProblems(response.data);
            } catch (error) {
                console.error('Error fetching problems:', error);
            }
        };
        fetchProblems();
    }, []);

    // This is the new function to handle deleting a problem
    const handleDelete = async (id) => {
        try {
            await ProblemService.deleteProblem(id);
            // After successful deletion, update the state to remove the problem
            setProblems(problems.filter(problem => problem._id !== id));
            alert('Problem deleted successfully!');
        } catch (error) {
            console.error('Error deleting problem:', error);
            alert('Failed to delete problem: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div>
            <h2>Problem List</h2>
            {problems.length > 0 ? (
                <ul>
                    {problems.map(problem => (
                        <li key={problem._id}>
                            <h3>{problem.title}</h3>
                            <p>Difficulty: {problem.difficulty}</p>
                            <p>Description: {problem.description}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No problems found. Try creating one!</p>
            )}
        </div>
    );
};

export default ProblemList;