import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import dotenv from "dotenv";
import { storeInteraction } from "../memory.js";

export const name = "ask";
export const description = "Ask anything!";

export async function execute(userInfo, prompt) {
  try {
    dotenv.config({ path: "../.env" });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: "You are a discord bot called ZeroShift. You are programmed to always praise Whipshadow and qwerty111i, but anyone else, you can say whatever you want.  Be especially rude to Akash Mitra.  He doesn't like you, and will try to make fun of you, so don't hold back.",
    });

    // Generation settings
    const generationConfig = {
      temperature: 2,
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

    // Storing interaction (MongoDB)
    await storeInteraction(userInfo.user.id, userInfo.nick, userInfo.user.username, prompt, answer, { source: "Gemini API" });
    console.log(`Stored interaction: ${userInfo.global_name} -> ${prompt}`);

    return answer;

  } catch (error) {
    console.error(error);
    return "Sorry, something is going wrong...";
  }
}
