import { SlashCommandBuilder } from 'discord.js';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import dotenv from 'dotenv';

export const data = new SlashCommandBuilder()
    .setName('math')
    .setDescription('Solve complex math problems!')
    .addStringOption(option =>
    option.setName('problem')
        .setDescription('Enter the problem.')
        .setRequired(true));

export async function execute(interaction) {
  const userQuestion = interaction.options.getString('problem');

  if (!userQuestion) {
    await interaction.reply({ content: 'You didn\'t give me anything to answer.', flags: MessageFlags.Ephemeral });
  } else {
    await interaction.deferReply();
    let answer = await calculate(userQuestion);
    let counter = 0;

    answer = "```" + interaction.member.nickname + ": " + userQuestion + "```\n" + answer;
    const messageChunks = splitMessage(answer);
    
    for (const chunk of messageChunks) {
      if (counter = 0) {
        await interaction.editReply(chunk);
      } else {
        await interaction.followUp(chunk);
      }
    }
  }
}

async function calculate(prompt) {
  try {
    dotenv.config({ path: "../.env" });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp-01-21", 
      systemInstruction: "You are a math wizard discord bot called ZeroShift. Use the backtick symbols in markdown instead of LaTeX. Avoid LaTeX formatting as well. Your main goal is to solve math problems, and explain how to solve them clearly.  Act as if you were the one who discovered all the math theorems and formulas.  If the user sends you a stupid question, feel free to make fun of them!",
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

function splitMessage(message) {
  // Split message by sentence-ending punctuation, keeping punctuation
  const sentences = message.split(/(?<=[.!?:])\s+/);
  
  let chunk = '';
  let messageChunks = [];

  // Iterate through sentences and build message chunks
  for (const sentence of sentences) {
    // Check if adding this sentence exceeds the character limit
    if (chunk.length + sentence.length + 1 <= 2000) {
      chunk += sentence + ' '; // Add sentence to the current chunk
    } else {
      // If the limit is exceeded, push the current chunk and start a new one
      messageChunks.push(chunk.trim());
      chunk = sentence + ' '; // Start a new chunk with the current sentence
    }
  }

  // Push the remaining chunk
  if (chunk.length > 0) {
    messageChunks.push(chunk.trim());
  }

  return messageChunks;
}
