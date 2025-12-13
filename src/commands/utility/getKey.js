'use strict';

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

module.exports = {
    name: 'getkey',
    description: 'Attempts to fetch an executor key from a given link by analyzing network traffic and page content.',
    usage: '-getkey <url>',
    permission: 'admin',

    /**
     * Executes the getkey command.
     * @param {Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        const url = args[0];

        if (!url) {
            return message.reply({ content: `❌ **Usage:** 
${this.usage}
` });
        }

        try {
            new URL(url);
        } catch (error) {
            return message.reply({ content: '❌ **Invalid URL:** Please provide a valid, full URL (e.g., https://example.com).' });
        }

        const statusMsg = await message.reply({ content: '🕵️‍♂️ **Analyzing Link...** Launching browser and navigating to page.' });

        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            
            await statusMsg.edit({ content: '🕵️‍♂️ **Analyzing Link...** Monitoring network requests and waiting for page to load.' });

            let keyFound = null;

            // Monitor network responses for potential keys
            page.on('response', async (response) => {
                const request = response.request();
                if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
                    try {
                        const json = await response.json();
                        // This is a placeholder - we'd need to know what the key looks like in a JSON response
                        if (json && (json.key || json.token)) {
                            keyFound = json.key || json.token;
                        }
                    } catch (e) {
                        // Not a json response, ignore
                    }
                }
            });

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            if (keyFound) {
                 await statusMsg.edit({ content: `✅ **Key Found (from network)!**


${keyFound}

` });
                 return;
            }

            await statusMsg.edit({ content: '🕵️‍♂️ **Analyzing Link...** Network analysis complete. Searching page content...' });

            // If no key found in network, search the final page content
            // This is a generic regex for long alphanumeric strings.
            const content = await page.content();
            const keyRegex = /[a-zA-Z0-9_-]{32,}/;
            const match = content.match(keyRegex);

            if (match) {
                keyFound = match[0];
                await statusMsg.edit({ content: `✅ **Key Found (from page content)!**


${keyFound}

` });
            } else {
                await statusMsg.edit({ content: '❌ **Key Not Found.**
I analyzed the page and its network traffic but could not identify a key. The site may have changed or the key is in a format I don\'t recognize.' });
            }

        } catch (error) {
            console.error("Error during puppeteer execution for -getkey:", error);
            await statusMsg.edit({ content: `❌ **An Error Occurred:**


${error.message}

. This could be due to an invalid link, a CAPTCHA, or a site that is blocking automated requests.` });
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
};
