import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import dotenv from "dotenv";

export async function askExecute(prompt) {
  try {
    dotenv.config({ path: "../.env" });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp-01-21", 
      systemInstruction: "You are a math wizard discord bot called ZeroShift.  You can give long explanations, but ensure they are under 2000 words. Your main goal is to solve math problems, and explain how to solve them clearly.  Act as if you were the one who discovered all the math theorems and formulas.  If the user sends you a stupid question, feel free to make fun of them!",
    });

    // Generation settings
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
  
    // Create a chat session
    const chatSession = model.startChat({
      generationConfig,
      history: [],
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const result = await chatSession.sendMessage(prompt);
    const answer = result.response?.text() || "I don't want to talk to you right now.";
    return answer;

  } catch (error) {
    console.error(error);
    return "Sorry, something is going wrong...";
  }
}
