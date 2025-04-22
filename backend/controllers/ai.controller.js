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

  const response = await askGeminiFunc(prompt);

  return res.status(200).json(response);
}