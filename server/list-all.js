const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

async function listAllModels() {
    const logFile = 'models_list.txt';
    fs.writeFileSync(logFile, '--- MODEL LISTING ---\n');

    try {
        if (!process.env.GEMINI_API_KEY) {
            fs.appendFileSync(logFile, 'ERROR: No API Key\n');
            return;
        }

        // The JS SDK doesn't expose listModels as directly as some other SDKs
        // We'll try to fetch it via the REST endpoint directly using fetch/axios
        // or just test the 'gemini-pro' and 'gemini-1.0-pro' classics too.

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const modelsToTest = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro',
            'gemini-1.0-pro',
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro-latest'
        ];

        for (const m of modelsToTest) {
            fs.appendFileSync(logFile, `Testing ${m}...\n`);
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent('ping');
                const response = await result.response;
                fs.appendFileSync(logFile, `  SUCCESS: ${m} works. Response: ${response.text().substring(0, 10)}\n`);
            } catch (err) {
                fs.appendFileSync(logFile, `  FAILED: ${m} - ${err.message}\n`);
            }
        }

    } catch (err) {
        fs.appendFileSync(logFile, 'GLOBAL ERROR: ' + err.message + '\n');
    }
}

listAllModels();
