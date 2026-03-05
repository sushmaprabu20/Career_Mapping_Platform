const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

async function singleTest() {
    const logFile = 'diagnostic_log.txt';
    fs.writeFileSync(logFile, '--- START DIAGNOSTIC ---\n');

    try {
        if (!process.env.GEMINI_API_KEY) {
            fs.appendFileSync(logFile, 'ERROR: No API Key\n');
            return;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        fs.appendFileSync(logFile, 'Testing gemini-1.5-flash...\n');
        const result = await model.generateContent('ping');
        const response = await result.response;
        fs.appendFileSync(logFile, 'SUCCESS: ' + response.text() + '\n');
    } catch (err) {
        fs.appendFileSync(logFile, 'FAILED: ' + err.message + '\n');
        if (err.stack) fs.appendFileSync(logFile, 'STACK: ' + err.stack + '\n');
    }
}

singleTest();
