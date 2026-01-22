/**
 * /sync Command
 * Sync Discord members with Corporate Warfare website
 * Corporate Warfare Discord Bot
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const config = require('../../config/config');
const { syncDiscordUsers } = require('../../services/corporateWarfareApi');
const { userRepository } = require('../../database/repositories');
const { EMOJIS } = require('../../constants');

// Max users per API request
const BATCH_SIZE = 1000;

module.exports = {
    category: 'Admin',
    data: new SlashCommandBuilder()
        .setName('sync')
        .setDescription('Sync Discord members with website profiles')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const guild = interaction.guild;
        if (!guild) {
            return interaction.editReply(`${EMOJIS.ERROR} This command can only be used in a server.`);
        }

        try {
            // Fetch all members
            await interaction.editReply(`${EMOJIS.LOADING} Fetching guild members...`);
            const members = await guild.members.fetch();
            
            // Filter out bots
            const humanMembers = members.filter(m => !m.user.bot);
            const totalMembers = humanMembers.size;
            
            await interaction.editReply(`${EMOJIS.LOADING} Syncing ${totalMembers} members...`);

            // Prepare batches
            const batches = [];
            let currentBatch = [];

            humanMembers.forEach(member => {
                currentBatch.push({
                    id: member.id,
                    username: member.user.username,
                    discriminator: member.user.discriminator,
                    avatar: member.user.avatar
                });

                if (currentBatch.length >= BATCH_SIZE) {
                    batches.push(currentBatch);
                    currentBatch = [];
                }
            });

            if (currentBatch.length > 0) {
                batches.push(currentBatch);
            }

            // Process batches
            let totalMatched = 0;
            let totalUnmatched = 0;
            let totalUpdated = 0;
            let errors = 0;

            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                await interaction.editReply(`${EMOJIS.LOADING} Processing batch ${i + 1}/${batches.length}...`);

                const result = await syncDiscordUsers(guild.id, batch);

                if (result && result.success) {
                    // Update stats
                    if (result.summary) {
                        totalMatched += result.summary.matched || 0;
                        totalUnmatched += result.summary.unmatched || 0;
                        totalUpdated += result.summary.updated || 0;
                    }

                    // Store matched users in local DB
                    if (result.matched && Array.isArray(result.matched)) {
                        for (const user of result.matched) {
                            userRepository.upsert(user);
                        }
                    }
                } else {
                    errors++;
                }
            }

            // Final report
            const embed = new EmbedBuilder()
                .setColor(config.colors.success)
                .setTitle('Sync Complete')
                .addFields(
                    { name: 'Total Processed', value: totalMembers.toString(), inline: true },
                    { name: 'Matched Users', value: totalMatched.toString(), inline: true },
                    { name: 'Unmatched', value: totalUnmatched.toString(), inline: true },
                    { name: 'Batches', value: `${batches.length}`, inline: true },
                    { name: 'Errors', value: errors.toString(), inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ content: null, embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply(`${EMOJIS.ERROR} An error occurred during sync: ${error.message}`);
        }
    }
};
