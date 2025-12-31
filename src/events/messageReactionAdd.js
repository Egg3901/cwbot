/**
 * Message Reaction Add Event
 * Handles ticket creation and welcome verification via reactions
 * Corporate Warfare Discord Bot
 */

const { Events } = require('discord.js');
const ticketConfig = require('../modules/tickets/ticketConfig');
const welcomeConfig = require('../modules/welcome/welcomeConfig');
const { createTicketSelectionUI } = require('../utils/ticketUI');
const { welcomeRepository } = require('../database/repositories');
const { getWelcomeModule, getTicketIntroMessages } = require('../services');

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
            if (welcomeRepository.isWelcomeMessage(reaction.message.id)) {
                const welcomeModule = getWelcomeModule();
                await welcomeModule.handleVerification(reaction, user);
                return;
            }
        }

        // Handle ticket creation
        if (emojiName === '🎫' || reaction.emoji.toString() === '🎫') {
            const ticketIntroMessages = getTicketIntroMessages();
            const isIntroMessage = ticketIntroMessages.has(reaction.message.id) ||
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
