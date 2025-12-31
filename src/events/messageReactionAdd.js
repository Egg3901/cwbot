/**
 * Message Reaction Add Event
 * Handles ticket creation via reactions
 * Corporate Warfare Discord Bot
 */

const { Events, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const ticketConfig = require('../modules/tickets/ticketConfig');
const config = require('../config/config');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user, client) {
        // Ignore bot reactions
        if (user.bot) return;

        console.log(`[Reactions] Reaction received: ${reaction.emoji.name} from ${user.tag}`);

        // Handle partial reactions (for uncached messages)
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('[Reactions] Error fetching reaction:', error);
                return;
            }
        }

        // Handle partial messages
        if (reaction.message.partial) {
            try {
                await reaction.message.fetch();
            } catch (error) {
                console.error('[Reactions] Error fetching message:', error);
                return;
            }
        }

        // Debug: log emoji comparison
        console.log(`[Reactions] Emoji: "${reaction.emoji.name}" vs config: "${ticketConfig.intro.emoji}"`);

        // Check if correct emoji (compare by name or by the actual character)
        const isTicketEmoji = reaction.emoji.name === ticketConfig.intro.emoji ||
                              reaction.emoji.name === '🎫' ||
                              reaction.emoji.toString() === '🎫';

        if (!isTicketEmoji) {
            console.log('[Reactions] Wrong emoji, ignoring');
            return;
        }

        // Ensure client is ready
        if (!client.user) {
            console.log('[Reactions] Client not ready');
            return;
        }

        // Debug: check message info
        console.log(`[Reactions] Message author: ${reaction.message.author?.id}, Bot: ${client.user.id}`);
        console.log(`[Reactions] In Set: ${client.ticketIntroMessages?.has(reaction.message.id)}`);
        console.log(`[Reactions] Embed title: ${reaction.message.embeds?.[0]?.title}`);

        // Check if this is a ticket intro message (by Set OR by embed content)
        const isIntroMessage = client.ticketIntroMessages?.has(reaction.message.id) ||
            (reaction.message.author?.id === client.user.id &&
             reaction.message.embeds?.[0]?.title?.includes(ticketConfig.intro.title));

        if (!isIntroMessage) {
            console.log('[Reactions] Not an intro message, ignoring');
            return;
        }

        console.log(`[Tickets] Reaction from ${user.tag} on intro message`);

        // Remove user's reaction
        try {
            await reaction.users.remove(user.id);
        } catch (error) {
            console.error('[Reactions] Error removing reaction:', error);
        }

        // Send ticket creation menu to user
        try {
            const options = ticketConfig.categories.map(cat => ({
                label: cat.label,
                description: cat.description,
                value: cat.id,
                emoji: cat.emoji
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('ticket_category_select')
                .setPlaceholder('Select a ticket category')
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle('🎫 Create a Ticket')
                .setDescription('Please select a category for your ticket below.\n\nA private channel will be created for you to discuss your issue with our staff.')
                .setFooter({ text: config.embedDefaults.footer })
                .setTimestamp();

            // Send ephemeral-like DM or channel message
            const channel = reaction.message.channel;
            const member = await reaction.message.guild.members.fetch(user.id);

            // Send message that auto-deletes
            const reply = await channel.send({
                content: `${user}`,
                embeds: [embed],
                components: [row]
            });

            // Delete after 60 seconds if not interacted with
            setTimeout(async () => {
                try {
                    await reply.delete();
                } catch (e) {
                    // Message may already be deleted
                }
            }, 60000);

        } catch (error) {
            console.error('[Reactions] Error sending ticket menu:', error);
        }
    }
};
