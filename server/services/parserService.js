const pdfLib = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');


const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);

        // Robust PDF library loading
        const parse = typeof pdfLib === 'function' ? pdfLib : (pdfLib && pdfLib.default);

        if (typeof parse !== 'function') {
            console.error('PDF Library structure:', typeof pdfLib, pdfLib);
            throw new Error('PDF parsing library structure is unknown');
        }

        const data = await parse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Inner PDF parsing error:', error);
        throw error;
    }
};

const extractTextFromDocx = async (filePath) => {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
};

const extractText = async (file) => {
    const filePath = file.path;
    const mimeType = file.mimetype;
    const originalName = file.originalname;
    const extension = path.extname(originalName).toLowerCase();

    console.log(`Processing file: ${originalName}, MimeType: ${mimeType}, Extension: ${extension}`);

    try {
        if (mimeType === 'application/pdf' || extension === '.pdf') {
            console.log('Detected PDF format, extracting...');
            return await extractTextFromPDF(filePath);
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword' ||
            extension === '.docx' ||
            extension === '.doc'
        ) {
            console.log('Detected Word format, extracting...');
            return await extractTextFromDocx(filePath);
        } else {
            console.error(`Unsupported file type: ${mimeType} (${originalName})`);
            throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
        }
    } catch (error) {
        console.error(`Extraction error for ${originalName}:`, error);
        throw new Error(`Failed to extract text from ${extension.toUpperCase()}: ${error.message}`);
    }
};


module.exports = {
    extractText,
};
