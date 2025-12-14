'use strict';

const { MessageEmbed } = require('../../index.js');

module.exports = {
    name: 'massdm',
    description: 'Sends a direct message to all members of the server. [DANGEROUS: HIGH RISK OF ACCOUNT BAN]',
    usage: '-massdm <message>',
    permission: 'owner',

    /**
     * Executes the massdm command.
     * @param {import('discord.js-selfbot-v13').Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {import('discord.js-selfbot-v13').Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        if (!message.guild) {
            return message.reply("❌ This command can only be used in a server.");
        }
        const dmMessage = args.join(' ');
        if (!dmMessage) {
            return message.reply(`❌ **Usage:** \`${this.usage}\``);
        }

        const status = await message.reply('⏳ Fetching members...');

        try {
            // Fetch all members to get an accurate count
            const allMembers = await message.guild.members.fetch();
            const membersToDm = allMembers.filter(member => !member.user.bot);
            const memberCount = membersToDm.size;

            await status.edit({
                content: `⚠️ **ARE YOU SURE?** ⚠️
This will attempt to send a DM to **${memberCount}** members.
This action is a **violation of Discord's ToS** and can get your account **BANNED**.
Type \`yes\` to confirm, or wait 30 seconds to cancel.`
            });

            const filter = m => m.author.id === message.author.id && m.content.toLowerCase() === 'yes';
            const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

            collector.on('collect', async () => {
                let successCount = 0;
                let failCount = 0;
                let processedCount = 0;
                await status.edit(`🚀 **Starting Mass DM...** Will send a message to ${memberCount} members. This will take a while.`);

                for (const member of membersToDm.values()) {
                    processedCount++;
                    try {
                        await member.send(dmMessage);
                        successCount++;
                    } catch (error) {
                        // This usually means the user has DMs closed or has blocked the bot.
                        failCount++;
                    }
                    
                    // Update status periodically
                    if (processedCount % 10 === 0 || processedCount === memberCount) {
                         await status.edit(`🚀 Progress: ${processedCount}/${memberCount} members processed.
✅ Success: ${successCount}
❌ Failed: ${failCount}`);
                    }

                    // CRUCIAL: Wait between messages to avoid rate limits and detection.
                    const delay = 7000 + Math.random() * 3000; // 7-10 seconds
                    await new Promise(res => setTimeout(res, delay));
                }

                await status.edit(`✅ **Mass DM Complete.**
Sent to **${successCount}** members.
Failed to send to **${failCount}** members.`);
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    status.edit('❌ **Mass DM Canceled.** Confirmation not received in time.');
                }
            });

        } catch (error) {
            console.error('[massdm] A critical error occurred:', error);
            await status.edit('❌ **A critical error occurred.** Could not fetch members or start the process.');
        }
    }
};
