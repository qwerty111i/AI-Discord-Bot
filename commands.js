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
        .setDescription('Enter user ID.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('information')
        .setDescription('Enter information.')
        .setRequired(true))
    .toJSON(),

    new SlashCommandBuilder()
    .setName('summary')
    .setDescription('Get a summary of anything')
    .addStringOption(option =>
      option.setName('summary')
        .setDescription('Enter the summary.')
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
