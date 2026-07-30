import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);
const outputPath = path.join(path.resolve(), 'backend', 'outputs');

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Execute code inside an isolated Docker container with resource constraints.
 */
export const executeInDocker = async (language, code, inputData = '', timeLimitSec = 5, memoryLimitMB = 256) => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    let filename = '';
    let image = '';
    let runCmd = '';

    switch (language) {
        case 'python':
            filename = `${uniqueId}.py`;
            image = 'python:3.11-slim';
            runCmd = `python /code/${filename}`;
            break;
        case 'javascript':
            filename = `${uniqueId}.js`;
            image = 'node:20-slim';
            runCmd = `node /code/${filename}`;
            break;
        case 'cpp':
            filename = `${uniqueId}.cpp`;
            image = 'gcc:13';
            runCmd = `g++ /code/${filename} -o /code/${uniqueId} && /code/${uniqueId}`;
            break;
        case 'java':
            filename = 'Main.java';
            image = 'openjdk:21-slim';
            runCmd = `javac /code/${filename} -d /code && java -cp /code Main`;
            break;
        default:
            throw new Error(`Unsupported language for Docker execution: ${language}`);
    }

    const filepath = path.join(outputPath, filename);
    const inputPath = path.join(outputPath, `${uniqueId}.in`);

    try {
        fs.writeFileSync(filepath, code);
        fs.writeFileSync(inputPath, inputData);

        // Docker command with security constraints
        // --network none: disables networking
        // --memory & --cpus: limits memory and CPU usage
        // -v: mounts only the outputs temp directory read-only / read-write
        const dockerCmd = `docker run --rm \\
            --network none \\
            --memory="${memoryLimitMB}m" \\
            --cpus="1.0" \\
            -v "${outputPath}:/code" \\
            ${image} \\
            sh -c "${runCmd} < /code/${uniqueId}.in"`;

        const { stdout, stderr } = await execPromise(dockerCmd, { timeout: timeLimitSec * 1000 });

        return {
            output: (stdout || '').trim(),
            error: (stderr || '').trim()
        };
    } catch (err) {
        if (err.killed || err.signal === 'SIGTERM') {
            return { error: 'Time Limit Exceeded (TLE)' };
        }
        return { error: err.stderr || err.message || 'Execution error' };
    } finally {
        // Clean up temporary files
        try { if (fs.existsSync(filepath)) fs.unlinkSync(filepath); } catch (_) {}
        try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch (_) {}
        try {
            const execFile = path.join(outputPath, uniqueId);
            if (fs.existsSync(execFile)) fs.unlinkSync(execFile);
        } catch (_) {}
    }
};

export default executeInDocker;
