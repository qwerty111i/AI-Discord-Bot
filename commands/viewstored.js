import { SlashCommandBuilder } from 'discord.js';
import { viewUserInformation, viewGlobalInformation } from '../database/store.js';

export const data = new SlashCommandBuilder()
.setName('viewstored')
.setDescription('Get stored information about users.')
.addStringOption(option =>
  option.setName('user')
    .setDescription('Enter a user ID.')
    .setRequired(true));

export async function execute(interaction) {
    const userId = interaction.options.getString('user');
    const guildId = interaction.guild.id;
  
    if (!userId) {
        await interaction.reply({ content: 'Invalid inputs!', flags: MessageFlags.Ephemeral });
    } else if (interaction.member.user.id !== '496802108540977162' && interaction.member.user.id !== '434110212933419009') {
        await interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    } else {
        await interaction.deferReply();

        let storedInformation;
        if (userId !== 'global') {
            storedInformation = await viewUserInformation(userId);
        } else {
            storedInformation = await viewGlobalInformation(guildId);
        }
    
        if (storedInformation === 'Something went wrong while accessing the stored information!' || 
        storedInformation === 'No information stored for this user!' || 
        storedInformation === 'No global information stored!') {
            await interaction.editReply(storedInformation);
        } else {
            let printStoredInformation = "**" + storedInformation[0] + "**" + "\n";
            for (let i = 1; i < storedInformation.length; i++) {
                printStoredInformation += i + ". " + storedInformation[i] + "\n";
            }
            
            await interaction.editReply(printStoredInformation.toString());
        }
    }
}