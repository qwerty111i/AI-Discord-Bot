import { SlashCommandBuilder } from 'discord.js';
import { storeUserInformation, storeGlobalInformation } from '../database/store.js';

export const data = new SlashCommandBuilder()
    .setName('store')
    .setDescription('Store information about users.')
    .addStringOption(option =>
    option.setName('user')
        .setDescription('Enter a user ID.')
        .setRequired(true))
    .addStringOption(option =>
    option.setName('information')
        .setDescription('Enter information.')
        .setRequired(true));

export async function execute(interaction) {
    const userId = interaction.options.getString('user');
    const information = interaction.options.getString('information');
  
    if (!userId || !information) {
        await interaction.reply({ content: 'Invalid inputs!', flags: MessageFlags.Ephemeral });
    } else if (interaction.member.user.id !== '496802108540977162' && interaction.member.user.id !== '434110212933419009') {
        await interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    } else {
        await interaction.deferReply();

        let storedMessage;
        if (userId !== 'global') {
            storedMessage = await storeUserInformation(userId, information);
        } else {
            storedMessage = await storeGlobalInformation(information);
        }

        await interaction.editReply(storedMessage);
    }
}