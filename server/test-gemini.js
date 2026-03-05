const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testGemini() {
    console.log('--- Gemini API Diagnostic ---');
    console.log('API Key present:', !!process.env.GEMINI_API_KEY);

    if (!process.env.GEMINI_API_KEY) {
        console.error('ERROR: GEMINI_API_KEY is missing');
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const modelsToTest = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];

    for (const modelName of modelsToTest) {
        console.log(`\nTesting model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hi');
            const response = await result.response;
            console.log(`SUCCESS: ${modelName} responded:`, response.text().substring(0, 20) + '...');
        } catch (err) {
            console.error(`FAILED: ${modelName}`);
            console.error(`  Error Code: ${err.status || 'N/A'}`);
            console.error(`  Error Message: ${err.message}`);
        }
    }
}

testGemini();
