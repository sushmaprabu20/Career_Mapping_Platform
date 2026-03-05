const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

async function liteTest() {
    const logFile = 'lite_test_result.txt';
    fs.writeFileSync(logFile, '--- LITE TEST ---\n');

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Explicitly using the name from the discovery list
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        fs.appendFileSync(logFile, 'Testing gemini-2.0-flash-lite...\n');
        const result = await model.generateContent('Say hello in one word.');
        const response = await result.response;
        fs.appendFileSync(logFile, 'SUCCESS: ' + response.text() + '\n');
    } catch (err) {
        fs.appendFileSync(logFile, 'FAILED: ' + err.message + '\n');
        if (err.stack) fs.appendFileSync(logFile, 'STACK: ' + err.stack + '\n');
    }
}

liteTest();
