/**
 * Ticket Transcript Service
 * Corporate Warfare Discord Bot
 *
 * Handles ticket transcript generation and formatting
 */

const { TIMEOUTS } = require('../../../constants');
const { ticketRepository } = require('../../../database/repositories');

/**
 * Generate a text transcript for a ticket channel
 * @param {TextChannel} channel - The ticket channel
 * @returns {Promise<string>} Formatted transcript text
 */
async function generateTranscript(channel) {
    const messages = await channel.messages.fetch({ limit: TIMEOUTS.MESSAGE_FETCH_LIMIT });
    const ticket = ticketRepository.findByChannelId(channel.id);

    let transcript = buildHeader(channel, ticket);
    transcript += buildMessageLog(messages);

    return transcript;
}

/**
 * Build transcript header with metadata
 * @param {TextChannel} channel - The ticket channel
 * @param {Object|null} ticket - Ticket data from database
 * @returns {string} Header text
 */
function buildHeader(channel, ticket) {
    let header = `# Ticket Transcript\n`;
    header += `**Ticket:** #${ticket?.id || 'Unknown'}\n`;
    header += `**Channel:** ${channel.name}\n`;
    header += `**Generated:** ${new Date().toISOString()}\n`;

    if (ticket) {
        header += `**Status:** ${ticket.status}\n`;
        header += `**Created By:** ${ticket.creatorId}\n`;
        if (ticket.claimedBy) {
            header += `**Claimed By:** ${ticket.claimedBy}\n`;
        }
        if (ticket.subject) {
            header += `**Subject:** ${ticket.subject}\n`;
        }
    }

    header += `\n---\n\n`;
    return header;
}

/**
 * Build message log from fetched messages
 * @param {Collection<string, Message>} messages - Discord messages collection
 * @returns {string} Formatted message log
 */
function buildMessageLog(messages) {
    const sortedMessages = [...messages.values()].reverse();
    let log = '';

    for (const msg of sortedMessages) {
        const timestamp = msg.createdAt.toISOString();
        const author = msg.author.tag;
        const content = formatMessageContent(msg);
        log += `[${timestamp}] ${author}: ${content}\n`;
    }

    return log;
}

/**
 * Format message content including attachments and embeds
 * @param {Message} msg - Discord message
 * @returns {string} Formatted content
 */
function formatMessageContent(msg) {
    let content = msg.content || '';

    // Note attachments
    if (msg.attachments.size > 0) {
        const attachmentList = msg.attachments.map(a => a.url).join(', ');
        content += content ? ` [Attachments: ${attachmentList}]` : `[Attachments: ${attachmentList}]`;
    }

    // Note embeds
    if (msg.embeds.length > 0 && !content) {
        content = '[Embed]';
    }

    return content || '[Empty message]';
}

/**
 * Generate HTML transcript (future enhancement)
 * @param {TextChannel} channel - The ticket channel
 * @returns {Promise<string>} HTML formatted transcript
 */
async function generateHtmlTranscript(channel) {
    const messages = await channel.messages.fetch({ limit: TIMEOUTS.MESSAGE_FETCH_LIMIT });
    const ticket = ticketRepository.findByChannelId(channel.id);
    const sortedMessages = [...messages.values()].reverse();

    let html = `<!DOCTYPE html>
<html>
<head>
    <title>Ticket #${ticket?.id || 'Unknown'} Transcript</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #5865F2; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .message { padding: 10px; border-bottom: 1px solid #eee; }
        .timestamp { color: #666; font-size: 12px; }
        .author { font-weight: bold; color: #5865F2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Ticket #${ticket?.id || 'Unknown'}</h1>
        <p>Channel: ${channel.name}</p>
        <p>Generated: ${new Date().toISOString()}</p>
    </div>
`;

    for (const msg of sortedMessages) {
        html += `    <div class="message">
        <span class="timestamp">${msg.createdAt.toISOString()}</span>
        <span class="author">${msg.author.tag}</span>
        <p>${escapeHtml(formatMessageContent(msg))}</p>
    </div>\n`;
    }

    html += `</body></html>`;
    return html;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = {
    generateTranscript,
    generateHtmlTranscript,
    buildHeader,
    buildMessageLog,
    formatMessageContent,
};
