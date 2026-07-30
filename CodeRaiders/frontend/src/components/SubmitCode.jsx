import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { Editor } from '@monaco-editor/react';
import { Loader2, ServerCrash, Play, Send } from 'lucide-react';
import { useClientExecutor } from '../hooks/useClientExecutor';

const SubmitCode = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const apiPrivate = useAxiosPrivate();
    const { runLocally, pyodideLoading } = useClientExecutor();

    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Run Code feature ---
    const [runCases, setRunCases] = useState([
        { label: 'Custom Input 1', input: '', expectedOutput: '', output: '', hint: '' },
        { label: 'Custom Input 2', input: '', expectedOutput: '', output: '', hint: '' }
    ]);
    const [isRunning, setIsRunning] = useState(false);

    // --- State for Submit Code feature ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);

    const normalizeOutput = (value) => {
        if (typeof value !== 'string') {
            return '';
        }

        return value
            .trim()
            .replace(/^output:\s*/i, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    useEffect(() => {
        const fetchProblemDetails = async () => {
            try {
                const response = await apiPrivate.get(`/api/problems/${problemId}`);
                setProblem(response.data);
                setCode('');
                const sampleCases = (response.data.testCases || []).slice(0, 2);
                const firstCase = sampleCases[0]?.input || '';
                const secondCase = sampleCases[1]?.input || sampleCases[0]?.input || '';
                setRunCases([
                    {
                        label: 'Custom Input 1',
                        input: firstCase,
                        expectedOutput: normalizeOutput(sampleCases[0]?.output || ''),
                        output: '',
                        hint: ''
                    },
                    {
                        label: 'Custom Input 2',
                        input: secondCase,
                        expectedOutput: normalizeOutput(sampleCases[1]?.output || ''),
                        output: '',
                        hint: ''
                    }
                ]);
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
            setCode('');
        }
    }, [language, problem]);

    // --- Run Code (Client Side Execution for Practice) ---
    const handleRunCode = async () => {
        setIsRunning(true);

        try {
            const results = await Promise.all(
                runCases.map(async (testCase) => {
                    if (language === 'javascript' || language === 'python') {
                        return await runLocally(language, code, testCase.input);
                    } else {
                        // Fallback to server execution if language isn't supported client side
                        try {
                            const res = await apiPrivate.post('/api/execute', { language, code, input: testCase.input });
                            return { output: res.data?.output?.trim() || '' };
                        } catch (err) {
                            return { error: err.response?.data?.message || err.message };
                        }
                    }
                })
            );

            setRunCases((currentCases) =>
                currentCases.map((testCase, index) => {
                    const res = results[index];
                    const out = res.output ? res.output.trim() : '';
                    const err = res.error || '';
                    const isMatch = normalizeOutput(out) === testCase.expectedOutput;

                    return {
                        ...testCase,
                        output: out,
                        error: err,
                        hint: err ? '' : (!isMatch ? 'Hint: the output for this sample does not match the expected answer. Check your computation logic.' : '')
                    };
                })
            );
        } catch (err) {
            console.error("Run code failed:", err);
        } finally {
            setIsRunning(false);
        }
    };

    // --- Submit Code ---
    const handleSubmitCode = async () => {
        setIsSubmitting(true);
        setSubmissionResult(null);

        // If practice problem & JS/Python, evaluate test cases locally for instant feedback before saving submission
        if (language === 'javascript' || language === 'python') {
            const sampleTestCases = (problem?.testCases || []).slice(0, 2);
            const testCaseResults = [];
            let overallResult = 'Accepted';

            for (let i = 0; i < sampleTestCases.length; i++) {
                const tc = sampleTestCases[i];
                const res = await runLocally(language, code, tc.input);
                const actualOutput = normalizeOutput(res.output || '');
                const expectedOutput = normalizeOutput(tc.output || '');

                if (res.error) {
                    overallResult = 'Runtime Error';
                    testCaseResults.push({
                        caseNumber: i + 1,
                        input: tc.input,
                        expectedOutput,
                        actualOutput: res.error,
                        passed: false,
                        error: res.error
                    });
                    break;
                }

                const passed = actualOutput === expectedOutput;
                if (!passed) overallResult = 'Wrong Answer';

                testCaseResults.push({
                    caseNumber: i + 1,
                    input: tc.input,
                    expectedOutput,
                    actualOutput,
                    passed
                });
            }

            try {
                // Record submission to backend
                const response = await apiPrivate.post('/api/submissions', {
                    problemId,
                    language,
                    code,
                    clientResult: { result: overallResult, testCaseResults }
                });
                setSubmissionResult(response.data.testCaseResults ? response.data : { result: overallResult, testCaseResults });
                setTimeout(() => navigate('/submissions'), 2000);
            } catch (err) {
                setSubmissionResult({ result: overallResult, testCaseResults });
                setTimeout(() => navigate('/submissions'), 2000);
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // Fallback server submit for other languages
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
                <div className={`px-3 py-1 inline-block rounded-full text-sm font-medium mb-6 ${problem?.difficulty === 'Easy' ? 'bg-green-900/50 text-green-300' : problem?.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-red-900/50 text-red-300'}`}>
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

                {/* --- NEW: Two-up run panel --- */}
                <div className="flex-grow flex min-h-0 flex-col h-[50%] border-t border-slate-700 overflow-hidden">
                    <div className="p-4 bg-slate-800">
                        <h3 className="text-lg font-semibold">Test with Custom Input</h3>
                    </div>
                    <div className="grid flex-grow min-h-0 gap-0 border-t border-slate-700 overflow-hidden lg:grid-cols-2">
                        {runCases.map((testCase, index) => (
                            <div key={testCase.label} className={`flex min-h-0 flex-col overflow-hidden ${index === 0 ? 'border-b border-slate-700 lg:border-b-0 lg:border-r' : ''} border-slate-700`}>
                                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
                                    <h4 className="font-semibold">{testCase.label}</h4>
                                </div>
                                <div className="flex flex-1 min-h-0 flex-col p-4 gap-3 overflow-hidden">
                                    <textarea
                                        value={testCase.input}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setRunCases((currentCases) => currentCases.map((currentTestCase, currentIndex) => (
                                                currentIndex === index ? { ...currentTestCase, input: value } : currentTestCase
                                            )));
                                        }}
                                        placeholder="Enter your custom input here..."
                                        className="min-h-[90px] w-full flex-[0.8] rounded-md border border-slate-700 bg-slate-950 p-4 font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 custom-scrollbar"
                                    />
                                    <div className="min-h-0 flex-[1.4] rounded-md border border-slate-700 bg-slate-950 p-4 font-mono text-sm text-white overflow-y-auto custom-scrollbar">
                                        {isRunning ? 'Running...' : testCase.error ? (
                                            <div className="space-y-2 text-red-300">
                                                <p className="font-semibold">Mistake detected</p>
                                                <p className="whitespace-pre-wrap">{testCase.error}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <pre className="whitespace-pre-wrap">{testCase.output || 'Output will appear here.'}</pre>
                                                {testCase.hint && (
                                                    <p className="whitespace-pre-wrap text-amber-300">{testCase.hint}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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
                    <div className={`m-4 p-4 rounded-md ${submissionResult.result === 'Accepted' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                        <p className="font-bold text-lg text-center">{submissionResult.result}</p>
                        {submissionResult.testCaseResults && (
                            <div className="mt-4 space-y-3 text-sm">
                                {submissionResult.testCaseResults.map((item) => (
                                    <div key={item.caseNumber} className="rounded-md border border-white/10 bg-black/20 p-3">
                                        <p className="font-semibold">Test Case {item.caseNumber}: {item.passed ? 'Passed' : 'Failed'}</p>
                                        <p className="mt-1 text-slate-300">Expected: {item.expectedOutput}</p>
                                        <p className="text-slate-300">Actual: {item.actualOutput}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmitCode;

