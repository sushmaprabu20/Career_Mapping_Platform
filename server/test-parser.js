const { extractText } = require('./services/parserService');
const path = require('path');
const fs = require('fs');

async function testParser() {
    console.log('--- Testing Parser Service ---');

    // Check if there are any files in uploads to test with
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }

    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf'));

    if (files.length === 0) {
        console.log('No PDF files found in server/uploads to test with.');
        console.log('Please place a sample resume.pdf in server/uploads/ to run this test.');
        return;
    }

    const testFile = {
        path: path.join(uploadsDir, files[0]),
        originalname: files[0],
        mimetype: 'application/pdf'
    };

    console.log(`Testing with file: ${testFile.path}`);

    try {
        const text = await extractText(testFile);
        console.log('SUCCESS: Text extracted successfully.');
        console.log('Text length:', text.length);
        console.log('Preview (first 100 chars):', text.substring(0, 100));
    } catch (err) {
        console.error('FAILED: Extraction error:', err);
    }
}

testParser();
