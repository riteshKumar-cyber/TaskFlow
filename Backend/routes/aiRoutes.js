const express = require("express");
const router = express.Router();
const ai = require("../config/gemini");

// Helper function to retry AI calls on transient network/timeout errors
const generateContentWithRetry = async (params, maxRetries = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      lastError = err;
      console.warn(`[AI Route] Attempt ${attempt}/${maxRetries} failed:`, err.message || err);
      if (attempt < maxRetries) {
        // Wait before retrying (1s, then 2s)
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }
  throw lastError;
};

router.post("/suggest", async (req, res) => {
  try {
    const { description, currentDate } = req.body;

    const prompt = `
You are a project management assistant.
You can read and understand tasks written in any language (e.g., English, Hindi, Hinglish, Spanish, French, etc.), but you must output your recommendations in English.

Based on the task description, suggest:
1. title (clear, concise task title in English)
2. priority (Low, Medium, or High)
3. estimate (e.g. 2 hours, 1 day, 3 days)
4. dueDate (format: YYYY-MM-DDTHH:mm, calculated relative to the current date/time if mentioned or inferred from the description. Current date and time is: ${currentDate || new Date().toISOString()})

If no due date can be inferred from the description, default to 3 days from the current date.

Description:
${description}

Return ONLY valid JSON in this format:

{
  "title": "",
  "priority": "",
  "estimate": "",
  "dueDate": ""
}
`;

    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text ? response.text.trim() : "";

    // Remove markdown code blocks if present (```json ... ``` or ``` ...)
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    const data = JSON.parse(text);

    res.json(data);
  } catch (err) {
    console.error("[AI Route Error]:", err);
    res.status(500).json({
      message: err.message || "Failed to generate AI suggestions",
    });
  }
});

module.exports = router;