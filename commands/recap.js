import { SlashCommandBuilder } from 'discord.js';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { viewGlobal } from '../database/memory.js';
import { fetchMessages } from './helper/messagefetch.js';
import dotenv from 'dotenv';

export const data = new SlashCommandBuilder()
    .setName('recap')
    .setDescription('Missed a ton of messages?  Get a quick recap!')
    .addIntegerOption(option =>
    option.setName('number')
        .setDescription('Enter the number of past messages to recap.')
        .setRequired(true));

export async function execute(interaction) {
    const numMessages = interaction.options.getInteger('number');  
       
    if (numMessages < 1 || numMessages > 500) {
      await interaction.reply({ 
        content: "Invalid message count!  Choose a number between 1 and 500.", 
        ephemeral: true
      });
    } else {
      await interaction.deferReply();
      const messages = await fetchMessages(interaction.channel, numMessages);
      const recap = await getRecap(messages, interaction.guild.id);
      await interaction.editReply(recap);
    }
}

async function getRecap(messages, guildId) {
  try {
    let recapMessages = [];
    messages.reverse().forEach((msg) => {
      recapMessages.push(`${msg.author.username}: "${msg.content}" + "\n"`);
    });
    let textTemplate = "You are a discord bot called ZeroShift.  You cannot respond with more than 2000 characters.  Here is the information you know: $(global_info).  Your primary goal is to summarize the messages that are inputted.  The global information is for contextualization so you can provide a more robust summary.  Your messages might also come up into the chat history, keep this in mind while summarizing.  Make the summarization as interesting as possible, and don't worry about making it short.";

    // Get global info
    let globalMemory = await viewGlobal(guildId);
    if (typeof globalMemory !== 'string') {
      globalMemory = globalMemory.join("\n");
    }
    
    // Replacing placeholders and storing it in a variable
    let finalText = textTemplate
      .replace("$(global_info)", globalMemory);
    
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

    const result = await chatSession.sendMessage(recapMessages);
    const answer = result.response?.text() || "I don't want to talk to you right now.";
    return answer;
  } catch (error) {
    console.error(error);
    return "Sorry, something is going wrong...";
  }
}