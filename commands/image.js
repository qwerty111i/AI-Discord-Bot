import { SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from "@google/genai";

export const data = new SlashCommandBuilder()
  .setName('genimg')
  .setDescription('Create AI Images!')
  .addStringOption(option =>
    option.setName('description')
      .setDescription('Describe the image you want to generate.')
      .setRequired(true));

export async function execute(interaction) {
  const userPrompt = interaction.options.getString('description');

  if (!userPrompt) {
    await interaction.reply({ content: 'You didn\'t give me anything to generate.', ephemeral: true });
    return;
  } else {
    await interaction.deferReply();
  }
  
  let image = await imageGenerate(userPrompt);

  if (image && Buffer.isBuffer(image)) {
    await interaction.followUp({
      files: [{
        attachment: image,
        name: 'generated-image.png'
      }]
    });
  } else {
    await interaction.followUp("Failed to generate image.");
  }
}

async function imageGenerate(prompt) {
  try {
    dotenv.config({ path: "../.env" });
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    

    // Generate image with response modality set to IMAGE
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT,Modality.IMAGE],
      },
    });
    // Loop through the response parts to extract the inline image data
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log(part.text);

      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");
        return buffer;
      }
    }
    // Return null if no image data is found
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
