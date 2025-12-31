const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config/config');

module.exports = {
    category: 'Admin',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),

    async execute(interaction, client) {
        const sent = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true
        });

        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle('Pong!')
            .addFields(
                { name: 'Bot Latency', value: `${latency}ms`, inline: true },
                { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
            )
            .setFooter({ text: config.embedDefaults.footer })
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    }
};
