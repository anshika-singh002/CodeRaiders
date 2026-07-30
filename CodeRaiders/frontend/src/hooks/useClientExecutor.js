import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to execute JavaScript code in a sandboxed iframe
 * and Python code using Pyodide (loaded dynamically via CDN).
 */
export function useClientExecutor() {
    const [pyodideLoaded, setPyodideLoaded] = useState(false);
    const [pyodideLoading, setPyodideLoading] = useState(false);
    const pyodideRef = useRef(null);

    // Load Pyodide script lazily when needed
    const loadPyodideRuntime = async () => {
        if (pyodideRef.current) return pyodideRef.current;
        if (window.loadPyodide) {
            setPyodideLoading(true);
            const pyodide = await window.loadPyodide();
            pyodideRef.current = pyodide;
            setPyodideLoaded(true);
            setPyodideLoading(false);
            return pyodide;
        }

        return new Promise((resolve, reject) => {
            setPyodideLoading(true);
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
            script.async = true;
            script.onload = async () => {
                try {
                    const pyodide = await window.loadPyodide();
                    pyodideRef.current = pyodide;
                    setPyodideLoaded(true);
                    setPyodideLoading(false);
                    resolve(pyodide);
                } catch (err) {
                    setPyodideLoading(false);
                    reject(err);
                }
            };
            script.onerror = (err) => {
                setPyodideLoading(false);
                reject(new Error('Failed to load Pyodide runtime from CDN.'));
            };
            document.head.appendChild(script);
        });
    };

    /**
     * Executes JS code inside a sandboxed iframe
     */
    const executeJS = (code, input = '') => {
        return new Promise((resolve) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.sandbox = 'allow-scripts';
            document.body.appendChild(iframe);

            const timeoutId = setTimeout(() => {
                cleanUp();
                resolve({ error: 'Time Limit Exceeded (Execution timed out after 5s)' });
            }, 5000);

            const cleanUp = () => {
                clearTimeout(timeoutId);
                window.removeEventListener('message', handleMessage);
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            };

            const handleMessage = (event) => {
                if (event.source === iframe.contentWindow) {
                    cleanUp();
                    resolve(event.data);
                }
            };

            window.addEventListener('message', handleMessage);

            const runnerScript = `
                <script>
                    (function() {
                        let logs = [];
                        const customConsole = {
                            log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
                            error: (...args) => logs.push("Error: " + args.join(' ')),
                            warn: (...args) => logs.push("Warning: " + args.join(' '))
                        };
                        const inputData = ${JSON.stringify(input)};

                        try {
                            const userFunc = new Function('console', 'input', ${JSON.stringify(code)});
                            const result = userFunc(customConsole, inputData);
                            
                            let outputStr = logs.join('\\n');
                            if (result !== undefined && logs.length === 0) {
                                outputStr = typeof result === 'object' ? JSON.stringify(result) : String(result);
                            }
                            window.parent.postMessage({ output: outputStr }, '*');
                        } catch (err) {
                            window.parent.postMessage({ error: err.message || String(err) }, '*');
                        }
                    })();
                </script>
            `;

            iframe.srcdoc = runnerScript;
        });
    };

    /**
     * Executes Python code using Pyodide
     */
    const executePython = async (code, input = '') => {
        try {
            const pyodide = await loadPyodideRuntime();

            // Reset standard output capture in Python
            await pyodide.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

            if (input) {
                // Set custom input variable if provided
                pyodide.globals.set('input_data', input);
            }

            await pyodide.runPythonAsync(code);

            const output = await pyodide.runPythonAsync(`sys.stdout.getvalue()`);
            const errorOutput = await pyodide.runPythonAsync(`sys.stderr.getvalue()`);

            if (errorOutput && errorOutput.trim().length > 0) {
                return { output: output.trim(), error: errorOutput.trim() };
            }

            return { output: output.trim() };
        } catch (err) {
            return { error: err.message || String(err) };
        }
    };

    /**
     * Run function dispatching to corresponding runner
     */
    const runLocally = async (language, code, input = '') => {
        if (language === 'javascript') {
            return await executeJS(code, input);
        } else if (language === 'python') {
            return await executePython(code, input);
        } else {
            return { error: `Client-side execution for '${language}' is not supported. Please use JavaScript or Python for local practice.` };
        }
    };

    return {
        runLocally,
        pyodideLoading,
        pyodideLoaded
    };
}
