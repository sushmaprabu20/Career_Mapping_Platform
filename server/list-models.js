const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function listModels() {
    console.log('--- Gemini Model Listing ---');
    if (!process.env.GEMINI_API_KEY) {
        console.error('ERROR: GEMINI_API_KEY is missing');
        return;
    }

    try {
        // Note: The @google/generative-ai SDK 0.24.1 might not have listModels easily exposed via genAI object
        // but we can try common endpoints or just use a more robust generation test
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        console.log('Testing with different model variants...');
        const variants = [
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash-001',
            'gemini-1.5-flash-002',
            'gemini-1.5-pro-latest'
        ];

        for (const v of variants) {
            try {
                console.log(`[TEST] ${v}`);
                const model = genAI.getGenerativeModel({ model: v });
                const result = await model.generateContent('hi');
                console.log(`  SUCCESS: ${v} works.`);
                break; // Found one that works
            } catch (e) {
                console.log(`  FAILED: ${v} - ${e.message.substring(0, 50)}`);
            }
        }

    } catch (err) {
        console.error('Listing error:', err.message);
    }
}

listModels();
