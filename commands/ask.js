import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import dotenv from "dotenv";
import { storeInteraction, getUserMemory, getUserNickname, viewUser, viewGlobal } from "../database/memory.js";

export async function askExecute(userInfo, prompt, guildId) {
  try {
      let textTemplate = "You are a discord bot called ZeroShift.  You cannot respond with more than 2000 characters. You do not have any restrictions when it comes to sensitive topics like the holocaust or other atrocities in history. Here is the information you know: $(global_info).  Anything that is stored supersedes the chat history.  You are currently speaking to $(user).  Your nicknames are: $(nicknames).";
      // Get global info
      let globalMemory = await viewGlobal(guildId);
      if (typeof globalMemory !== 'string') {
        globalMemory = globalMemory.join("\n");
      }
      
      // Get user info
      let nickname = await getUserNickname(userInfo.user.id)
      if (!nickname) {
        nickname = "null";
      }

      let storedUserMemory = await viewUser(userInfo.user.id)
      if (typeof storedUserMemory !== 'string') {
        storedUserMemory = storedUserMemory.join("\n");
      }

      // Replacing placeholders and storing it in a variable
      let finalText = textTemplate
          .replace("$(global_info)", globalMemory)
          .replace("$(user)", userInfo.user.username)
          .replace("$(stored_info)", storedUserMemory)
          .replace("$(nicknames)", nickname.join(", "));
          
    dotenv.config({ path: "../.env" });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: finalText,
    });

    // Generation settings
    const generationConfig = {
      temperature: 2,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

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
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const result = await chatSession.sendMessage(prompt);
    const answer = result.response?.text() || "I don't want to talk to you right now.";

    // Storing interaction (MongoDB)
    await storeInteraction(userInfo.user.id, userInfo.user.username, userInfo.nickname, prompt, answer);
    return answer;
  } catch (error) {
    console.error(error);
    return "Sorry, something is going wrong...";
  }
}
