const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

async function finalTest() {
    const logFile = 'final_test_log.txt';
    fs.writeFileSync(logFile, '--- FINAL TEST ---\n');

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        fs.appendFileSync(logFile, 'Testing gemini-2.0-flash...\n');
        const result = await model.generateContent('ping');
        const response = await result.response;
        fs.appendFileSync(logFile, 'SUCCESS: ' + response.text() + '\n');
    } catch (err) {
        fs.appendFileSync(logFile, 'FAILED: ' + err.message + '\n');
    }
}

finalTest();
