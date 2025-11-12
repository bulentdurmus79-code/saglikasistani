import { GoogleGenAI, Type } from "@google/genai";

// Fix: Per Gemini API guidelines, initialize directly with process.env.API_KEY.
// The availability of the API key is assumed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Identifies a medication from a base64 encoded image.
 * @param base64Image The base64 encoded image string.
 * @returns A string describing the identified medication.
 */
export const identifyMedication = async (base64Image: string): Promise<string> => {
  // Fix: Per Gemini API guidelines, assume API key is configured.
  // The check for API key availability is removed.
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };
    const textPart = { text: "Bu görseldeki ilaç nedir? Adını ve temel kullanım amacını belirtin." };
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error identifying medication:", error);
    return "İlaç tanınırken bir hata oluştu.";
  }
};

/**
 * Parses a natural language voice command into a structured task object.
 * @param command The voice command from the user.
 * @returns A structured task object or null if parsing fails.
 */
export const parseCommandToTask = async (command: string): Promise<any | null> => {
  // Fix: Per Gemini API guidelines, assume API key is configured.
  // The check for API key availability is removed.
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Kullanıcı komutunu JSON formatında bir göreve dönüştür: "${command}". JSON'da title, time (HH:mm formatında), ve type (Medication, Measurement, Activity, Appointment, Other arasından biri) alanları olmalı.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Görevin başlığı" },
            time: { type: Type.STRING, description: "Görevin saati, HH:mm formatında" },
            type: { type: Type.STRING, description: "Görevin tipi" },
          },
          required: ["title", "time", "type"],
        },
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing command to task:", error);
    return null;
  }
};
