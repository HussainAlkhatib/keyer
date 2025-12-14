'use strict';

const { MessageEmbed } = require('../../index.js');

module.exports = {
    name: 'id',
    description: 'Gets the Discord ID of a user.',
    usage: '-id [@user]',
    permission: 'owner',

    /**
     * Executes the id command.
     * @param {import('discord.js-selfbot-v13').Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {import('discord.js-selfbot-v13').Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        const user = message.mentions.users.first() || message.author;

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`\`\`\`${user.id}\`\`\``)
            .setFooter({ text: `Requested by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};
