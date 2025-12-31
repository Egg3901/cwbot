/**
 * Message Reaction Add Event
 * Handles ticket creation and welcome verification via reactions
 * Corporate Warfare Discord Bot
 */

const { Events } = require('discord.js');
const ticketConfig = require('../modules/tickets/ticketConfig');
const welcomeConfig = require('../modules/welcome/welcomeConfig');
const { createTicketSelectionUI } = require('../utils/ticketUI');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        if (user.bot) return;

        // Handle partials
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('[Reactions] Error fetching reaction:', error);
                return;
            }
        }

        if (reaction.message.partial) {
            try {
                await reaction.message.fetch();
            } catch (error) {
                console.error('[Reactions] Error fetching message:', error);
                return;
            }
        }

        const client = reaction.client;
        if (!client.user) return;

        const emojiName = reaction.emoji.name;

        // Handle welcome verification
        if (emojiName === '✅' || reaction.emoji.toString() === welcomeConfig.verifyEmoji) {
            const welcomeModule = client.modules.get('welcome');
            if (welcomeModule && client.welcomeMessages?.has(reaction.message.id)) {
                await welcomeModule.handleVerification(reaction, user);
                return;
            }
        }

        // Handle ticket creation
        if (emojiName === '🎫' || reaction.emoji.toString() === '🎫') {
            const isIntroMessage = client.ticketIntroMessages?.has(reaction.message.id) ||
                (reaction.message.author?.id === client.user.id &&
                 reaction.message.embeds?.[0]?.title?.includes(ticketConfig.intro.title));

            if (!isIntroMessage) return;

            // Remove user's reaction
            try {
                await reaction.users.remove(user.id);
            } catch (error) {
                // Silently fail
            }

            // Send ticket creation menu
            try {
                const { embed, row } = createTicketSelectionUI();
                const channel = reaction.message.channel;

                const reply = await channel.send({
                    content: `${user}`,
                    embeds: [embed],
                    components: [row]
                });

                // Auto-delete after 60 seconds
                setTimeout(async () => {
                    try {
                        await reply.delete();
                    } catch (e) {
                        // Already deleted
                    }
                }, 60000);

            } catch (error) {
                console.error('[Reactions] Error sending ticket menu:', error);
            }
        }
    }
};
