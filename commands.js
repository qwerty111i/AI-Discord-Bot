import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.APP_ID;
const guildId = "1293953828256878685";

// Define your command(s)
const commands = [
  new SlashCommandBuilder()
    .setName('test')
    .setDescription('Replies with Pong!')
    .toJSON(), 

    new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask anything!')
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
    // For a guild-based command (good for testing)
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    
    // Uncomment the following code to register commands globally:
    // await rest.put(
    //   Routes.applicationCommands(clientId),
    //   { body: commands }
    // );

  } catch (error) {
    console.error(error);
  }
})();
