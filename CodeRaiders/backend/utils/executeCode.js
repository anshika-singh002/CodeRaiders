import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const outputPath = path.join(path.resolve(), 'backend', 'outputs');

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

// Helper function to generate a unique filename
const generateFilename = (language) => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    switch (language) {
        case 'cpp':
            return `${uniqueId}.cpp`;
        case 'java':
            return `Main.java`; // A simplification for Java class name
        case 'python':
            return `${uniqueId}.py`;
        case 'javascript':
            return `${uniqueId}.js`;
        default:
            return `${uniqueId}.txt`;
    }
};

const executeCode = (language, code, inputData) => {
    return new Promise((resolve, reject) => {
        const filename = generateFilename(language);
        const filepath = path.join(outputPath, filename);

        if (language === 'java' && !/public\s+class\s+Main/.test(code)) {
            return reject(new Error("Java code must contain a 'public class Main' definition."));
        }

        fs.writeFileSync(filepath, code);

        let command = '';
        let executablePath = '';

        switch (language) {
            case 'cpp':
                executablePath = path.join(outputPath, `${path.basename(filename, '.cpp')}`);
                if (process.platform === "win32") {
                    executablePath += ".exe";
                }
                command = `g++ "${filepath}" -o "${executablePath}" && "${executablePath}"`;
                break;
            case 'java':
                command = `javac "${filepath}" -d "${outputPath}" && java -cp "${outputPath}" Main`;
                break;
            case 'python':
                command = `python "${filepath}"`;
                break;
            case 'javascript':
                command = `node "${filepath}"`;
                break;
            default:
                fs.unlinkSync(filepath);
                return reject(new Error('Unsupported language.'));
        }

        const childProcess = exec(command, { input: inputData }, (error, stdout, stderr) => {
            // Clean up the created files after execution
            try { fs.unlinkSync(filepath); } catch (e) {}
            if (executablePath) {
                try { fs.unlinkSync(executablePath); } catch (e) {}
            }
            if (language === 'java') {
                 try { fs.unlinkSync(path.join(outputPath, 'Main.class')); } catch (e) {}
            }

            if (error || stderr) {
                return reject(error || stderr);
            }
            resolve(stdout);
        });

        if (inputData) {
            childProcess.stdin.write(inputData);
            childProcess.stdin.end();
        }
    });
};

export default executeCode;
