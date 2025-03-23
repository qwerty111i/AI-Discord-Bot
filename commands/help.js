import { SlashCommandBuilder } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of available commands.');

export async function execute(interaction) {
    const helpEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('📜 Help Menu')
        .setDescription('Here are the available commands:')
        .addFields(
        { name: '1️⃣ `/ping`', value: 'Learn my backstory.', inline: false },
        { name: '2️⃣ `/ask`', value: 'Ask anything your heart desires!\n**Usage:** `/ask question:<your question>`\n**Example:** `/ask question:What is the meaning of life?`', inline: false },
        { name: '3️⃣ `/recap`', value: 'Missed a ton of messages? Get a quick recap!\n**Usage:** `/recap number:<number>`\n**Example:** `/recap number:10` _(Summarizes the last 10 messages)_', inline: false },
        { name: '4️⃣ `/math`', value: 'Solve complex math problems!\n**Usage:** `/math problem:<math expression>`\n**Example:** `/math problem:2+2*5` _(Returns 12)_', inline: false }
        )
        .setFooter({ text: 'Use /command to interact with me!' });

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
}