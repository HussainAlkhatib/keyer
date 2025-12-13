'use strict';

const { Guild, Collection } = require("../../index.js");

// All the helper functions from the original file are kept here
async function cloneGuildSettings(sourceGuild, targetGuild, statusMessage) {
    await statusMessage.edit(`- Cloning server-level settings (name, icon, etc.)...
`);
    try {
        await targetGuild.edit({
            name: sourceGuild.name,
            icon: sourceGuild.iconURL({ dynamic: true, size: 4096 }),
            description: sourceGuild.description,
            verificationLevel: sourceGuild.verificationLevel,
            defaultMessageNotifications: sourceGuild.defaultMessageNotifications,
            explicitContentFilter: sourceGuild.explicitContentFilter,
            splash: sourceGuild.splashURL(),
            banner: sourceGuild.bannerURL(),
        });
    } catch (err) {
        await statusMessage.edit(`- ⚠️ Could not set all guild settings (e.g., banner). This usually happens if the target server lacks the required boost level. Continuing...
`);
        console.error(`Non-critical error setting guild settings: ${err.message}`);
    }
}

async function clearGuild(targetGuild, statusMessage) {
    await statusMessage.edit(`- Clearing target server of all existing channels and roles...
`);
    for (const channel of targetGuild.channels.cache.values()) {
        try {
            await channel.delete("Cloning process: clearing old structure.");
        } catch (err) { console.error(`Failed to delete channel ${channel.name}:`, err.message); }
    }
    for (const role of targetGuild.roles.cache.values()) {
        if (role.id === targetGuild.id || role.managed) continue;
        try {
            await role.delete("Cloning process: clearing old roles.");
        } catch (err) { console.error(`Failed to delete role ${role.name}:`, err.message); }
    }
}

function mapPermissions(permissionOverwrites, createdRoles) {
    return permissionOverwrites.map(p => ({
        id: createdRoles.get(p.id)?.id ?? p.id,
        allow: p.allow.bitfield,
        deny: p.deny.bitfield,
        type: p.type
    }));
}


module.exports = {
    name: 'clone',
    description: 'Clones an entire server structure (roles, channels, settings).',
    usage: '-clone <sourceServerID> <targetServerID>',
    permission: 'owner',

    /**
     * Executes the clone command.
     * @param {import('discord.js-selfbot-v13').Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {import('discord.js-selfbot-v13').Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        const [sourceGuildId, targetGuildId] = args;

        if (!sourceGuildId || !targetGuildId) {
            return message.reply(`❌ **Usage:** 
${this.usage}`);
        }
        if (!/^\d{17,19}$/.test(sourceGuildId) || !/^\d{17,19}$/.test(targetGuildId)) {
            return message.reply("❌ **Invalid ID:** Please provide valid server IDs.");
        }

        const statusMessage = await message.reply("🚀 **Starting Server Clone...**");

        try {
            const sourceGuild = client.guilds.cache.get(sourceGuildId);
            const targetGuild = client.guilds.cache.get(targetGuildId);

            if (!sourceGuild || !targetGuild) {
                return statusMessage.edit("❌ **Error:** Could not find both servers. Make sure you are a member of both the source and target servers.");
            }

            await statusMessage.edit(`🚀 **Starting Clone**
- **From:** ${sourceGuild.name}
- **To:** ${targetGuild.name}`);

            // Step 1: Clear and Setup
            await clearGuild(targetGuild, statusMessage);
            await cloneGuildSettings(sourceGuild, targetGuild, statusMessage);
            await new Promise(r => setTimeout(r, 1500));

            // Step 2: Clone Roles
            await statusMessage.edit(`- Roles cloned. Cloning channels...
`);
            await new Promise(r => setTimeout(r, 1500));

            // Step 3: Clone Channels
            const sourceChannels = sourceGuild.channels.cache.sort((a, b) => a.position - b.position);
            const categoryMap = new Collection();
            
            for (const channel of sourceChannels.filter((c) => c.type === "GUILD_CATEGORY").values()) {
                try {
                    const newCategory = await targetGuild.channels.create(channel.name, {
                        type: "GUILD_CATEGORY",
                        position: channel.position,
                        permissionOverwrites: mapPermissions(channel.permissionOverwrites.cache, createdRoles),
                    });
                    categoryMap.set(channel.id, newCategory);
                } catch (err) { console.error(`Failed to create category ${channel.name}:`, err.message); }
            }

            await new Promise(r => setTimeout(r, 1500));

            for (const channel of sourceChannels.filter((c) => ["GUILD_TEXT", "GUILD_VOICE", "GUILD_NEWS"].includes(c.type)).values()) {
                try {
                    await targetGuild.channels.create(channel.name, {
                        type: channel.type,
                        topic: channel.topic,
                        nsfw: channel.nsfw,
                        bitrate: channel.bitrate,
                        userLimit: channel.userLimit,
                        rateLimitPerUser: channel.rateLimitPerUser,
                        position: channel.position,
                        parent: channel.parentId ? categoryMap.get(channel.parentId)?.id : null,
                        permissionOverwrites: mapPermissions(channel.permissionOverwrites.cache, createdRoles),
                    });
                } catch (err) { console.error(`Failed to create channel ${channel.name}:`, err.message); }
            }

            await statusMessage.edit(`✅ **Clone Complete!**
Server structure of 
${sourceGuild.name} has been cloned to 
${targetGuild.name}.`);

        } catch (error) {
            console.error("A critical error occurred during the cloning process:", error);
            await statusMessage.edit("❌ **A critical error occurred.** Check the console for more details.");
        }
    }
};
