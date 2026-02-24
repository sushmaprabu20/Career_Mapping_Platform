const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateAIRoadmap = async (targetCareer, missingSkills, readinessScore) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error('CRITICAL: GEMINI_API_KEY is missing in process.env');
    throw new Error('AI configuration missing. Please ensure GEMINI_API_KEY is set in your .env file.');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Safety check for skills
  const limitedSkills = missingSkills.slice(0, 15); // Limit to top 15 gaps for prompt clarity

  const prompt = `Act as an expert career mentor. Create a 3-month (12-week) career development roadmap.
Target Role: ${targetCareer}
Current Match Score: ${readinessScore}%
Specific Skill Gaps to Address: ${limitedSkills.join(', ')}

Strict Requirements:
1. Divide into 3 months.
2. Each month MUST have exactly 4 weeks.
3. Every week MUST have a "goal" and a list of "tasks".
4. Return the data as a PURE JSON object without any markdown formatting or preamble.

Expected JSON Structure:
{
  "months": [
    {
      "month": 1,
      "weeks": [
        { "week": 1, "goal": "Foundational understanding of X", "tasks": ["Task 1", "Task 2"] },
        { "week": 2, "goal": "Intermediate Y", "tasks": ["Task 3"] },
        { "week": 3, "goal": "Z Implementation", "tasks": ["Task 4"] },
        { "week": 4, "goal": "Month 1 Project", "tasks": ["Task 5"] }
      ]
    }
  ]
}
Output only the JSON.`;

  try {
    console.log(`[AI SERVICE] Initiating generation for ${targetCareer} using gemini-1.5-flash...`);

    // Use 1.5-flash as default, then fallback
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('[AI SERVICE] Response received. Processing JSON...');

    try {
      const parsed = JSON.parse(text);
      if (!parsed.months) throw new Error("Missing 'months' key in AI response");
      return parsed;
    } catch (parseErr) {
      console.warn('[AI SERVICE] JSON parse failed, attempting regex extraction...');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error(`AI response parsing failed: ${text.substring(0, 100)}`);
    }
  } catch (error) {
    console.error('[AI SERVICE] Error with gemini-1.5-flash:', error.message);

    // Logic for model fallback if 1.5-flash failed due to availability or name issues
    if (error.message.includes('not found') || error.message.includes('404') || error.message.includes('not supported')) {
      console.log('[AI SERVICE] gemini-1.5-flash failed, trying gemini-1.5-pro...');
      try {
        const backupModel = genAI.getGenerativeModel({
          model: "gemini-1.5-pro",
          generationConfig: { responseMimeType: "application/json" }
        });
        const backupResult = await backupModel.generateContent(prompt);
        const backupText = await backupResult.response.text();

        try {
          return JSON.parse(backupText);
        } catch (parseErr) {
          const jsonMatch = backupText.match(/\{[\s\S]*\}/);
          if (jsonMatch) return JSON.parse(jsonMatch[0]);
          throw new Error("Failed to parse JSON from backup model");
        }
      } catch (backupError) {
        console.error('[AI SERVICE] Backup model also failed:', backupError.message);
        throw new Error(`Roadmap generation failed with all available models. Error: ${backupError.message}`);
      }
    }

    throw new Error(`AI Roadmap Service Error: ${error.message}`);
  }
};


module.exports = {
  generateAIRoadmap,
};
