/**
 * Utility Index
 * Corporate Warfare Discord Bot
 *
 * Barrel export for all utilities
 */

const errorHandler = require('./errorHandler');
const embedFactory = require('./embedFactory');

module.exports = {
    ...errorHandler,
    embed: embedFactory,
};
