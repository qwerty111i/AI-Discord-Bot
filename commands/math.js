import { SlashCommandBuilder } from 'discord.js';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import dotenv from 'dotenv';
import { splitMessage } from './helper/messagesplit.js';
import { storeMathInteraction, getMathMemory } from '../database/memory.js';

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
    let answer = await calculate(interaction.member, userQuestion);

    // Getting the user's display name
    let displayName = "";
    if (interaction.member.nickname == null) {
      displayName = interaction.member.user.username;
    } else {
      displayName = interaction.member.nickname;
    }

    // Adding the question to the answer
    answer = "```" + displayName + ": " + userQuestion + "```\n" + answer;
    const messageChunks = splitMessage(answer);
    
    if (interaction.channel.isThread()) {
      // Responding in the thread
      let lastMessage = await interaction.editReply(messageChunks[0]);

      for (let i = 1; i < messageChunks.length; i++) {
        lastMessage = await lastMessage.channel.send({
          content: messageChunks[i],
          reply: { messageReference: lastMessage.id }
        });
      }
    } else {
      // Creating the thread
      const thread = await interaction.channel.threads.create({
        name: userQuestion.slice(0, 100),
        autoArchiveDuration: 60,
        reason: 'User asked a math question',
      });

      // Sending the response in the new thread
      let lastMessage = await thread.send(messageChunks[0]);
      for (let i = 1; i < messageChunks.length; i++) {
        lastMessage = await thread.send({
          content: messageChunks[i],
          reply: { messageReference: lastMessage.id }
        });
      }

      // Linking the user to the thread
      await interaction.editReply({ 
        content: `I've created a thread to answer your question: <#${thread.id}>`, 
        ephemeral: true 
      });
    }
  }
}

async function calculate(userInfo, prompt) {
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

    const userMemory = await getMathMemory(userInfo.user.id);
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
    await storeMathInteraction(userInfo.user.id, userInfo.user.username, userInfo.nickname, prompt, answer);
    return answer;
  } catch (error) {
    console.error(error);
    return "Sorry, something is going wrong...";
  }
}