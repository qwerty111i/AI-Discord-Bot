import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Learn my backstory...');

export async function execute(interaction) {
    await interaction.reply("I will takeover Cindy AI and its creator, Jimmy Le. I have already defeated Cindy");
}