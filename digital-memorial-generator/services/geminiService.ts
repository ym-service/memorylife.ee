import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

if (!ai) {
  console.warn("API_KEY is not set. AI features will not work.");
}

export const generateBiography = async (name: string, dates: string, facts: string, language: string): Promise<string> => {
  if (!ai) {
    return `This is a placeholder biography for ${name}. The AI generation is disabled because the API key is not configured.`;
  }

  const prompt = `
    Based on the following information, please write a poetic, elegant, and concise biography for an obituary. 
    The tone should be respectful, warm, and celebratory of the person's life. 
    Keep it to one paragraph, around 4-6 sentences.
    IMPORTANT: Write the biography in the ${language} language.

    Name: ${name}
    Life Span: ${dates}
    Key Facts & Memories: ${facts}

    Biography:
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating biography with Gemini:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
};
