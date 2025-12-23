
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getHealthAdvice = async (symptoms: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User symptoms: ${symptoms}. Based on these symptoms, suggest which medical diagnostic tests from a standard laboratory (like CBC, Lipid Profile, Thyroid, Glucose, Liver Function) might be relevant to discuss with a doctor. Provide a brief explanation for each. Format as a professional health assistant. Disclaimer: Always consult a real doctor.`,
      config: {
        systemInstruction: "You are a professional medical diagnostic assistant for Sri Venkateswara Diagnostic. Your tone is helpful, empathetic, and professional. Always include a medical disclaimer.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Assistance Error:", error);
    return "I am currently unable to provide advice. Please consult our staff or a doctor directly.";
  }
};
