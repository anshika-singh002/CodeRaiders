import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { Editor } from '@monaco-editor/react';
import { Loader2, ServerCrash, Play, Send } from 'lucide-react';

const SubmitCode = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const apiPrivate = useAxiosPrivate();

    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- NEW State for Run Code feature ---
    const [customInput, setCustomInput] = useState('');
    const [runOutput, setRunOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    
    // --- State for Submit Code feature ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);

    useEffect(() => {
        const fetchProblemDetails = async () => {
            try {
                const response = await apiPrivate.get(`/api/problems/${problemId}`);
                setProblem(response.data);
                setCode(getBoilerplate(language, response.data.functionName));
                // Pre-fill custom input with the first test case
                if (response.data.testCases && response.data.testCases.length > 0) {
                    setCustomInput(response.data.testCases[0].input);
                }
            } catch (err) {
                console.error("Failed to fetch problem details:", err);
                setError("Could not load the problem.");
            } finally {
                setLoading(false);
            }
        };
        fetchProblemDetails();
    }, [problemId, apiPrivate]);

    // Update boilerplate when language changes
    useEffect(() => {
        if (problem) {
            setCode(getBoilerplate(language, problem.functionName));
        }
    }, [language, problem]);


    const getBoilerplate = (lang, functionName = 'solve') => {
        switch (lang) {
            case 'javascript': return `function ${functionName}(input) {\n  // Your code here\n  console.log("Hello, World!");\n}`;
            case 'python': return `def ${functionName}(input):\n  # Your code here\n  print("Hello, World!")`;
            case 'java': return `public class Solution {\n    public static void ${functionName}(String input) {\n        // Your code here\n        System.out.println("Hello, World!");\n    }\n}`;
            case 'cpp': return `#include <iostream>\n#include <string>\n\nvoid ${functionName}(std::string input) {\n    // Your code here\n    std::cout << "Hello, World!" << std::endl;\n}`;
            default: return '';
        }
    };

    // --- NEW: Function to handle "Run Code" ---
    const handleRunCode = async () => {
        setIsRunning(true);
        setRunOutput('');
        try {
            const response = await apiPrivate.post('/api/execute', {
                language,
                code,
                input: customInput,
            });
            setRunOutput(response.data.output);
        } catch (err) {
            console.error("Run code failed:", err);
            setRunOutput(err.response?.data?.message || "An error occurred while running the code.");
        } finally {
            setIsRunning(false);
        }
    };

    // This is the original submission function, renamed for clarity
    const handleSubmitCode = async () => {
        setIsSubmitting(true);
        setSubmissionResult(null);
        try {
            const response = await apiPrivate.post('/api/submissions', {
                problemId,
                language,
                code,
            });
            setSubmissionResult(response.data);
            setTimeout(() => navigate('/submissions'), 2000);
        } catch (err) {
            console.error("Submission failed:", err);
            setSubmissionResult({ result: 'Error', output: err.response?.data?.message || "Submission error." });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-slate-900"><Loader2 className="w-12 h-12 text-blue-500 animate-spin" /></div>;
    if (error) return <div className="flex justify-center items-center h-screen bg-slate-900 text-red-400"><ServerCrash className="w-16 h-16 mr-4" /> {error}</div>;

    return (
        <div className="flex h-screen bg-slate-900 text-white font-sans">
            {/* Left Pane: Problem Description */}
            <div className="w-1/2 p-8 overflow-y-auto custom-scrollbar">
                <h1 className="text-4xl font-bold mb-4">{problem?.title}</h1>
                 <div className={`px-3 py-1 inline-block rounded-full text-sm font-medium mb-6 ${ problem?.difficulty === 'Easy' ? 'bg-green-900/50 text-green-300' : problem?.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-red-900/50 text-red-300' }`}>
                    {problem?.difficulty}
                </div>
                <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-code:text-blue-300 prose-headings:text-white">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{problem?.description}</p>
                </div>
                <h2 className="text-2xl font-semibold mt-8 mb-4">Test Cases</h2>
                <div className="space-y-4">
                    {problem?.testCases.slice(0, 2).map((tc, index) => (
                        <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <h3 className="font-semibold mb-2">Example {index + 1}</h3>
                            <p className="font-mono text-sm"><span className="text-slate-400">Input:</span> {tc.input}</p>
                            <p className="font-mono text-sm"><span className="text-slate-400">Output:</span> {tc.output}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Pane: Code Editor and Submission */}
            <div className="w-1/2 flex flex-col border-l border-slate-700">
                <div className="p-4 flex justify-between items-center bg-slate-800 border-b border-slate-700">
                    <h2 className="text-xl font-semibold">Code Editor</h2>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>

                <div className="flex-grow relative h-[50%]">
                    <Editor height="100%" language={language} theme="vs-dark" value={code} onChange={(value) => setCode(value || '')} options={{ fontSize: 14, minimap: { enabled: false } }} />
                </div>
                
                {/* --- NEW: Test Case / Output Panel --- */}
                <div className="flex-grow flex flex-col h-[50%] border-t border-slate-700">
                    <div className="p-4 bg-slate-800">
                         <h3 className="text-lg font-semibold">Test with Custom Input</h3>
                    </div>
                    <div className="flex-grow p-4">
                        <textarea
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="Enter your custom input here..."
                            className="w-full h-full bg-slate-950 text-white font-mono text-sm p-4 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 custom-scrollbar"
                        />
                    </div>
                     <div className="p-4 bg-slate-800 border-t border-slate-700">
                        <h3 className="text-lg font-semibold mb-2">Output</h3>
                        <pre className="w-full h-24 bg-slate-950 text-white font-mono text-sm p-4 rounded-md overflow-y-auto custom-scrollbar border border-slate-700">
                            {isRunning ? 'Running...' : (runOutput || 'Your code output will appear here.')}
                        </pre>
                    </div>
                </div>

                {/* --- UPDATED: Action Buttons --- */}
                <div className="p-4 bg-slate-800 border-t border-slate-700 flex items-center gap-4">
                    <button onClick={handleRunCode} disabled={isRunning || isSubmitting} className="flex-1 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                        Run
                    </button>
                    <button onClick={handleSubmitCode} disabled={isSubmitting || isRunning} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                         {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        Submit
                    </button>
                </div>
                 {submissionResult && (
                    <div className={`m-4 p-4 rounded-md text-center ${submissionResult.result === 'Accepted' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                        <p className="font-bold text-lg">{submissionResult.result}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmitCode;

