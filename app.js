import { Client, GatewayIntentBits, Events, MessageFlags } from 'discord.js';
import { askExecute } from './commands/ask.js';
import { storeUserInformation, viewUserStoredInformation, deleteUserStoredInformation, 
  storeGlobalInformation, viewGlobalInformation, deleteGlobalInformation } from './commands/store.js';
import dotenv from 'dotenv';
import './commands.js';
import { deleteGlobal } from './database/memory.js';
dotenv.config();

const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for interactions
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'test') {
    interaction.reply("I will takeover Cindy AI and its creator, Jimmy Le.");
  }

  // ask Command
  if (interaction.commandName === 'ask') {
    const userQuestion = interaction.options.getString('question');

    if (!userQuestion) {
      interaction.reply({ content: 'You didn\'t give me anything to answer.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();
    

    // Execute ask.js
    const answer = await askExecute(interaction.member, userQuestion);
    console.log(answer)
    await interaction.editReply(answer);
  }

  // math Command
  if (interaction.commandName === 'math') {
    const userQuestion = interaction.options.getString('problem');

    if (!userQuestion) {
      interaction.reply({ content: 'You didn\'t give me anything to answer.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();
    
    // Execute math.js
    const answer = await askExecute(interaction.member, userQuestion);
    console.log(answer)
    await interaction.editReply(answer);
  }

  // store Command
  if (interaction.commandName === 'store') {
    const userId = interaction.options.getString('user');
    const userInformation = interaction.options.getString('information');

    if (!userId || !userInformation) {
      interaction.reply({ content: 'Invalid inputs!', flags: MessageFlags.Ephemeral });
    }

    if (interaction.member.user.id !== "496802108540977162" && interaction.member.user.id !== "434110212933419009") {
      interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    // Execute store.js
    const storedCorrectly = await storeUserInformation(userId, userInformation);
    if (storedCorrectly == true) {
      await interaction.editReply("Information has been stored!")
    } else {
      await interaction.editReply("Something went wrong...");
    }
  }

  // viewstored Command
  if (interaction.commandName === 'viewstored') {
    const userId = interaction.options.getString('user');

    if (!userId) {
      interaction.reply({ content: 'Invalid inputs!', flags: MessageFlags.Ephemeral });
    }

    if (interaction.member.user.id !== "496802108540977162" && interaction.member.user.id !== "434110212933419009") {
      interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    // Execute store.js
    const storedInformation = await viewUserStoredInformation(userId);
    let printStoredInformation = "";
    for (let i = 0; i < storedInformation.length; i++) {
      printStoredInformation += (i + 1) + ". " + storedInformation[i] + "\n";
    }
    await interaction.editReply(printStoredInformation.toString());
  }

  // deletestored Command
  if (interaction.commandName === 'deletestored') {
    const userId = interaction.options.getString('user');
    const index = interaction.options.getInteger('index');

    if (!userId) {
      interaction.reply({ content: 'Invalid inputs!', flags: MessageFlags.Ephemeral });
    }

    if (interaction.member.user.id !== "496802108540977162" && interaction.member.user.id !== "434110212933419009") {
      interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    // Execute store.js
    const deletionMessage = await deleteUserStoredInformation(userId, index);
    await interaction.editReply(deletionMessage.toString());
  }

  // storeglobal Command
  if (interaction.commandName === 'storeglobal') {
    const userInformation = interaction.options.getString('information');

    if (!userInformation) {
      interaction.reply({ content: 'Invalid inputs!', flags: MessageFlags.Ephemeral });
    }

    if (interaction.member.user.id !== "496802108540977162" && interaction.member.user.id !== "434110212933419009") {
      interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    // Execute store.js
    const storedCorrectly = await storeGlobalInformation(userInformation);
    if (storedCorrectly == true) {
      await interaction.editReply("Information has been stored!")
    } else {
      await interaction.editReply("Something went wrong...");
    }
  }

  // viewglobal Command
  if (interaction.commandName === 'viewglobal') {
    if (interaction.member.user.id !== "496802108540977162" && interaction.member.user.id !== "434110212933419009") {
      interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    // Execute store.js
    const storedInformation = await viewGlobalInformation();
    let printStoredInformation = "";
    for (let i = 0; i < storedInformation.length; i++) {
      printStoredInformation += (i + 1) + ". " + storedInformation[i] + "\n";
    }
    await interaction.editReply(printStoredInformation.toString());
  }

  // deleteglobal Command
  if (interaction.commandName === 'deleteglobal') {
    const index = interaction.options.getInteger('index');

    if (interaction.member.user.id !== "496802108540977162" && interaction.member.user.id !== "434110212933419009") {
      interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    // Execute store.js
    const deletionMessage = await deleteGlobalInformation(index);
    await interaction.editReply(deletionMessage.toString());
  }
});

client.login(token);