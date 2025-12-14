'use strict';

const { MessageEmbed } = require('../../index.js');

module.exports = {
    name: 'ping',
    description: 'Checks the bot\'s latency.',
    usage: '-ping',
    permission: 'owner',

    /**
     * Executes the ping command.
     * @param {import('discord.js-selfbot-v13').Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {import('discord.js-selfbot-v13').Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        const sentMsg = await message.reply({ content: '🏓 Pinging...' });

        const botLatency = sentMsg.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('🏓 Pong!')
            .addField('Bot Latency', `\`${botLatency}ms\``, true)
            .addField('API Latency', `\`${apiLatency}ms\``, true)
            .setTimestamp();

        await sentMsg.edit({ content: null, embeds: [embed] });
    }
};
