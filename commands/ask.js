import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import dotenv from "dotenv";
import { storeInteraction, getUserMemory } from "../database/memory.js";

export const name = "ask";
export const description = "Ask anything!";

export async function askExecute(userInfo, prompt) {
  try {
    dotenv.config({ path: "../.env" });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: "You are a discord bot called ZeroShift.  You cannot respond with more than 2000 characters.  You are currently speaking to $(user).  Here is the information about this user: $(storedInfo).  Anything that is stored superceeds what they tell you.",
    });

    // Generation settings
    const generationConfig = {
      temperature: 2,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    // Get user memory
    const userMemory = await getUserMemory(userInfo.user.id);
    let conversationHistory = [];

    // Formatting user prompts
    if (userMemory.length > 0) {
      conversationHistory = userMemory.map(interaction => ([
        {
          role: "user",
          parts: [{ text: interaction.question }]
        },
        {
          role: "model",
          parts: [{ text: interaction.answer }]
        }
      ])).flat();
    }

    // Add current prompt
    conversationHistory.push({
      role: "user",
      parts: [{ text: prompt }]
    });
    
    // Create a chat session
    const chatSession = model.startChat({
      generationConfig,
      history: conversationHistory,
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
    return answer;

  } catch (error) {
    console.error(error);
    return "Sorry, something is going wrong...";
  }
}
