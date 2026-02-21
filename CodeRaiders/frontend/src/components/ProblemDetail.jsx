import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProblemService from '../services/ProblemService';

const ProblemDetail = () => {
    const { problemId } = useParams();
    const [problem, setProblem] = useState(null);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await ProblemService.getProblemById(problemId);
                setProblem(response.data);
            } catch (error) {
                console.error('Error fetching problem details:', error);
            }
        };
        fetchProblem();
    }, [problemId]);

    if (!problem) {
        return <p>Loading problem details...</p>;
    }

    return (
        <div className="p-6">
            <h2>{problem.title}</h2>
            <p>Difficulty: {problem.difficulty}</p>
            <p>Description: {problem.description}</p>

            {/* The Submit Code button will now link to the submission page */}
            <Link to={`/problems/${problemId}/submit`} className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">
                Submit Your Code
            </Link>
        </div>
    );
};

export default ProblemDetail;