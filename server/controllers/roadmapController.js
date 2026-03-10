const Groq = require("groq-sdk");

const generateRoadmap = async (req, res) => {

  console.log(
    "[ROADMAP] Groq API Key loaded:",
    process.env.GROQ_API_KEY ? "Yes" : "No"
  );

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({
      message: "Groq API key is missing in .env file"
    });
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  const { missingSkills, targetCareer, readinessScore, duration } = req.body;

  if (!missingSkills || !targetCareer || !duration) {
    return res.status(400).json({
      message: "Missing required fields"
    });
  }

  const durationLabel =
    duration === 1
      ? "1 month"
      : duration <= 12
        ? `${duration} months`
        : `${Math.floor(duration / 12)} years`;

  const prompt = `
You are an expert career mentor and roadmap planner.

Your task is to generate a structured learning roadmap.

STUDENT PROFILE
Target Career: ${targetCareer}
Current Readiness Score: ${readinessScore}%
Missing Skills: ${missingSkills.join(", ")}
Available Learning Time: ${durationLabel} (YOU MUST SPREAD THE LEARNING CONTENT OVER THIS ENTIRE DURATION)

IMPORTANT RULES

1. Focus primarily on the student's MISSING SKILLS.
2. Ensure the roadmap still covers ALL important topics required for a professional ${targetCareer}.
3. YOU MUST scale the roadmap to exactly fit the ${durationLabel} timeframe.
4. If duration is 6 months, create at least 6 distinct phases (e.g., one per month) to ensure full coverage. Do not use a 3-month template for a 6-month request.
5. Provide higher depth and more practical projects for longer durations.
6. The roadmap must progress from foundation → intermediate → advanced.
7. Each phase must include its own duration label (e.g., "Month 1", "Week 2").

Return ONLY valid JSON in this structure:

{
"title":"Personalized ${targetCareer} Roadmap",
"duration":"${durationLabel}",
"overview":"Short description of the roadmap",
"focusSkills":[${missingSkills.map(s => `"${s}"`).join(",")}],
"phases":[
{
"phase":1,
"title":"Phase Title",
"duration":"Phase Duration (e.g. Month 1)",
"goal":"Goal of this phase",
"skills":["skill1","skill2"],
"tasks":[
{
"task":"Task description",
"resource":"Course or article",
"estimatedHours":5
}
],
"project":"Small project to practice",
"milestone":"What student achieves"
}
],
"tips":[
"Practice daily",
"Build projects",
"Revise weak areas"
]
}
`;

  try {

    console.log("[ROADMAP] Calling Groq API...");

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const aiResponse = completion.choices[0].message.content;

    let cleaned = aiResponse;

    const firstBrace = aiResponse.indexOf("{");
    const lastBrace = aiResponse.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = aiResponse.substring(firstBrace, lastBrace + 1);
    }

    const roadmap = JSON.parse(cleaned);

    return res.json({ roadmap });

  } catch (error) {

    console.error("[ROADMAP ERROR]", error);

    return res.status(500).json({
      message: "Failed to generate roadmap",
      error: error.message
    });

  }

};

module.exports = { generateRoadmap };