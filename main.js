'use strict';

const { Client } = require("./src/index");
const { loadCommands } = require('./src/utils/commandLoader');
const perms = require('./src/utils/permissions');

// For Replit, the token should be set in the "Secrets" tab.
// process.env.TOKEN
if (!process.env.TOKEN) {
    console.error("❌ Error: TOKEN not found in environment variables. Please set it in your Replit Secrets.");
    process.exit(1);
}

// Initialize the client
// Self-bots should disable intents they don't need to avoid detection.
// We are enabling the ones most likely needed for the requested commands.
const client = new Client({
    checkUpdate: false,
    intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_MESSAGES',
        'DIRECT_MESSAGES'
    ]
});

// Attach utility modules to the client for easy access within commands
client.permissions = perms;

// Load all commands from the src/commands/ directory
loadCommands(client);

// Ready event
client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`Prefix: "${perms.prefix}"`);
    console.log(`Owner ID: ${perms.ownerId}`);
    console.log(`Loaded ${client.commands.size} commands.`);
});

// Message event - this is the core command handler
client.on('messageCreate', async message => {
    // 1. Permission and Prefix check
    // Only process commands from owners or admins.
    if (!client.permissions.isAdmin(message.author.id)) return;
    
    // Check for the command prefix
    if (!message.content.startsWith(client.permissions.prefix)) return;

    // 2. Command Parsing
    // Remove prefix and split message into command name and arguments
    const args = message.content.slice(client.permissions.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // 3. Command Retrieval
    const command = client.commands.get(commandName);

    if (!command) return;

    // 4. Command-specific Permission Check
    if (command.permission) {
        if (command.permission === 'owner' && !client.permissions.isOwner(message.author.id)) {
            return message.reply({ content: "❌ This command can only be used by the bot owner." });
        }
    }

    // 5. Command Execution
    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(`Error executing command: ${command.name}`, error);
        await message.reply({ content: '❌ An error occurred while trying to execute this command.' });
    }
});

// Login to Discord
client.login(process.env.TOKEN).catch(err => {
    console.error("❌ Login Failed. Please check your token in Replit Secrets.", err);
});
