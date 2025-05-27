import { GoogleGenAI } from "@google/genai";

export const askGeminiFunc = async (question) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: question }],
      },
    ],
  });

  return response.text;
};

export const askGemini = async (req, res) => {
  const { prompt } = req.body;

  if (/\bform\b/i.test(prompt)) {
    return res.status(200).json("form");
  }

  if (/\bcharts?\b/i.test(prompt)) {
    return res.status(200).json("chart");
  }

  if (/\bstatus?\b/i.test(prompt)) {
    return res.status(200).json("status");
  }

  if (/\bspreadsheet?\b/i.test(prompt)) {
    return res.status(200).json("spreadsheet");
  }

  const response = await askGeminiFunc(prompt);

  return res.status(200).json(response);
}