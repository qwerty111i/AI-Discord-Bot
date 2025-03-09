import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.APP_ID;
const guildId = "1293953828256878685";

// Define your command(s)
const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Learn my backstory...')
    .toJSON(), 

    new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask anything your heart desires!')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Enter your question.')
        .setRequired(true))
    .toJSON(),

    new SlashCommandBuilder()
    .setName('store')
    .setDescription('Store information about users.')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('Enter a user ID.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('information')
        .setDescription('Enter information.')
        .setRequired(true))
    .toJSON(),

    new SlashCommandBuilder()
    .setName('viewstored')
    .setDescription('Get stored information about users.')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('Enter a user ID.')
        .setRequired(true))
    .toJSON(),

    new SlashCommandBuilder()
    .setName('deletestored')
    .setDescription('Delete stored information about users.')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('Enter a user ID.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('index')
        .setDescription('Enter memory index.')
        .setRequired(true))
    .toJSON(),

    new SlashCommandBuilder()
    .setName('recap')
    .setDescription('Missed a ton of messages?  Get a quick recap!')
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('Enter the number of past messages to recap.')
        .setRequired(true))
    .toJSON(),

    new SlashCommandBuilder()
    .setName('math')
    .setDescription('Solve complex math problems!')
    .addStringOption(option =>
      option.setName('problem')
        .setDescription('Enter the problem.')
        .setRequired(true))
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {        
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

  } catch (error) {
    console.error(error);
  }
})();
