import { SlashCommandBuilder } from 'discord.js';
import { deleteUser, deleteGlobal } from '../database/memory.js';

export const data = new SlashCommandBuilder()
    .setName('deletestored')
    .setDescription('Delete stored information about users.')
    .addStringOption(option =>
    option.setName('user')
        .setDescription('Enter a user ID.')
        .setRequired(true))
    .addIntegerOption(option =>
    option.setName('index')
        .setDescription('Enter memory index.')
        .setRequired(true));

export async function execute(interaction) {
    const userId = interaction.options.getString('user');
    const index = interaction.options.getInteger('index') - 1;

    if (!userId) {
        await interaction.reply({ content: 'Invalid inputs!', flags: MessageFlags.Ephemeral });
    } else if (interaction.member.user.id !== '496802108540977162' && interaction.member.user.id !== '434110212933419009') {
        await interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    } else {
        await interaction.deferReply();

        let deletionMessage;
        if (userId !== 'global') {
            deletionMessage = await deleteUserInformation(userId, index);
        } else {
            deletionMessage = await deleteGlobalInformation(index);
        }
        
        await interaction.editReply(deletionMessage);
    }
}

async function deleteUserInformation(userId, index) {
    try {
        const deletionMessage = await deleteUser(userId, index);
        return deletionMessage;
    } catch (e) {
        return "Something went wrong while trying to delete this user's information.";
    }
}

async function deleteGlobalInformation(index) {
    try {
        const deletionMessage = await deleteGlobal(index);
        return deletionMessage;
    } catch (e) {
        return "Something went wrong while trying to delete global information."
    }
}