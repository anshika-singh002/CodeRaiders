import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from 'react-simple-code-editor';

// 1. IMPORT YOUR SERVICES
import ProblemService from '../services/ProblemService';
import SubmissionService from '../services/SubmissionService';

// languageMap constant remains the same
const languageMap = {
    javascript: {
        name: 'JavaScript',
        prismLang: 'javascript',
        initialCode: `function solve(input) {\n  // Your code here\n  console.log("Hello, World!");\n}`
    },
    python: {
        name: 'Python',
        prismLang: 'python',
        initialCode: `def solve(input):\n  # Your code here\n  print("Hello, World!")`
    },
    java: {
        name: 'Java',
        prismLang: 'java',
        initialCode: `class Main {\n  public static void main(String[] args) {\n    // Your code here\n    System.out.println("Hello, World!");\n  }\n}`
    },
    cpp: {
        name: 'C++',
        prismLang: 'cpp',
        initialCode: `#include <iostream>\n\nint main() {\n  // Your code here\n  std::cout << "Hello, World!";\n  return 0;\n}`
    }
};

const SubmitCode = () => {
    const { problemId } = useParams();

    // 2. SET UP STATE FOR DATA, LOADING, AND ERRORS
    const [problem, setProblem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [output, setOutput] = useState('');
    const [code, setCode] = useState(languageMap.javascript.initialCode);
    const [language, setLanguage] = useState('javascript');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 3. FETCH DATA FROM YOUR BACKEND
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await ProblemService.getProblemById(problemId);
                setProblem(response.data);
            } catch (err) {
                setError("This problem could not be found.");
                console.error("Failed to fetch problem:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProblem();
    }, [problemId]); // Re-fetches if the ID in the URL changes

    useEffect(() => {
        setCode(languageMap[language].initialCode);
    }, [language]);

    useEffect(() => {
        if (window.Prism) {
            window.Prism.highlightAll();
        }
    }, [language, code]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setOutput('Running your code...');
        try {
            const response = await SubmissionService.submitCode(problemId, language, code);
            setOutput(`✅ Submission successful!\n\nResult: ${response.data.result}`);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setOutput(`❌ Submission failed!\n\nError: ${errorMessage}`);
        }
        setIsSubmitting(false);
    };


    // 4. RENDER UI BASED ON STATE
    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-8 max-w-screen-2xl mx-auto">

                {/* Left Column */}
                <div className="lg:w-1/2 bg-slate-800 rounded-xl shadow-lg p-6 lg:p-8 prose prose-invert prose-pre:bg-slate-900">
                    {isLoading && <h1 className="text-3xl font-bold">Loading...</h1>}
                    {error && (
                        <div>
                            <h1 className="text-3xl font-bold text-red-400">Not Found</h1>
                            <p>{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && problem && (
                        <>
                            <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
                            <div dangerouslySetInnerHTML={{ __html: problem.statement }} />
                        </>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:w-1/2 flex flex-col gap-4">
                    <div className="bg-slate-800 rounded-xl shadow-lg p-6 lg:p-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                {Object.entries(languageMap).map(([key, value]) => (
                                    <option key={key} value={key}>{value.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative mt-4 editor-container">
                            <Editor
                                value={code}
                                onValueChange={code => setCode(code)}
                                highlight={code => {
                                    if (window.Prism && window.Prism.languages[language]) {
                                        return window.Prism.highlight(code, window.Prism.languages[language], language);
                                    }
                                    return code;
                                }}
                                padding={20}
                                className="bg-slate-900 rounded-lg"
                                style={{
                                    fontFamily: '"Fira Code", "Fira Mono", monospace',
                                    fontSize: 16,
                                    minHeight: '400px',
                                }}
                            />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Code'}
                            </button>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-2 text-slate-300">Output</h4>
                        <pre className="bg-slate-800 p-4 rounded-lg min-h-[150px] whitespace-pre-wrap font-mono text-sm shadow-lg">
                            {output || 'Your submission output will appear here.'}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitCode;