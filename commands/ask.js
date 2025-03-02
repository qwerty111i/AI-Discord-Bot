import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import dotenv from "dotenv";
import { storeInteraction } from "../memory.js";

export const name = "ask";
export const description = "Ask anything!";

export async function execute(id, prompt) {
  try {
    dotenv.config({ path: "../.env" });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: "You are a discord bot called ZeroShift. You have been created by Adwaith (qwerty111i) and Sachin (Whipshadow).",
    });

    // Generation settings
    const generationConfig = {
      temperature: 2,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HATE, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUAL, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_VIOLENCE, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
      ],

    };

    // Create a chat session
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    const answer = result.response?.text() || "I don't want to talk to you right now.";

    // Storing interaction (MongoDB)
    await storeInteraction(id, prompt, answer, { source: "Gemini API" });
    console.log(`Stored interaction: ${id} -> ${prompt}`);

    return answer;

  } catch (error) {
    console.error(error);
    return "Sorry, something is going wrong...";
  }
}
