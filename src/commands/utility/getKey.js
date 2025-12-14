'use strict';

const axios = require('axios');

module.exports = {
    name: 'getkey',
    description: 'Fetches a key from a given link by analyzing network redirects or page content.',
    usage: '-getkey <keylink>',
    permission: 'owner',

    /**
     * Executes the getkey command.
     * @param {import('discord.js-selfbot-v13').Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {import('discord.js-selfbot-v13').Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        const keyLink = args[0];

        if (!keyLink) {
            return message.reply(`❌ **Usage:** \`${this.usage}\``);
        }

        const statusMessage = await message.reply('🔑 **Fetching key...** Please wait.');

        try {
            const response = await axios.get(keyLink, {
                // Let axios handle redirects by default, but set a timeout.
                timeout: 15000, 
                // Mimic a common browser user-agent to avoid being blocked.
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            // Strategy 1: Check the final URL after redirects.
            // This is the most common way key systems pass the key.
            const finalUrl = response.request.res.responseUrl;
            if (finalUrl && finalUrl !== keyLink) {
                // A redirect happened, the final URL is likely the key or contains it.
                return statusMessage.edit(`✅ **Key Found (from redirect)!**
\`\`\`${finalUrl}\`\`\``);
            }

            // Strategy 2: If no redirect, search the HTML body for a key-like string.
            // This is a fallback if the key is embedded directly in the page.
            const body = response.data;
            if (typeof body === 'string') {
                // Regex to find a long alphanumeric string (common for keys/tokens).
                // Looking for 32+ characters, often hex, but can include others.
                const keyRegex = /([a-zA-Z0-9-]{32,})/;
                const match = body.match(keyRegex);

                if (match && match[0]) {
                    return statusMessage.edit(`✅ **Key Found (in page content)!**
\`\`\`${match[0]}\`\`\``);
                }
            }

            // If both strategies fail.
            return statusMessage.edit('❌ **Key Not Found.** No redirect occurred and no key-like text was found in the page content. The site structure might have changed.');

        } catch (error) {
            console.error(`[getkey] Error fetching key from ${keyLink}:`, error);
            return statusMessage.edit(`❌ **An Error Occurred.** Could not fetch data from the link.
\`\`\`${error.message}\`\`\``);
        }
    }
};