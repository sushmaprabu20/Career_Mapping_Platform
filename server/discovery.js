const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

async function discovery() {
    const logFile = 'api_discovery.txt';
    fs.writeFileSync(logFile, '--- API DISCOVERY ---\n');

    try {
        if (!process.env.GEMINI_API_KEY) {
            fs.appendFileSync(logFile, 'ERROR: No API Key\n');
            return;
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const urls = [
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        ];

        for (const url of urls) {
            fs.appendFileSync(logFile, `Fetching ${url}...\n`);
            try {
                const response = await axios.get(url);
                fs.appendFileSync(logFile, `  SUCCESS: ${JSON.stringify(response.data.models.map(m => m.name))}\n`);
            } catch (err) {
                fs.appendFileSync(logFile, `  FAILED: ${err.message}\n`);
                if (err.response) {
                    fs.appendFileSync(logFile, `    Data: ${JSON.stringify(err.response.data)}\n`);
                }
            }
        }

    } catch (err) {
        fs.appendFileSync(logFile, 'GLOBAL ERROR: ' + err.message + '\n');
    }
}

discovery();
