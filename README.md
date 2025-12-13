# My Custom Self-Bot

This is a custom self-bot built on `discord.js-selfbot-v13` with a professional command framework and custom features.

## ⚠️ Warning

Using a self-bot is against Discord's Terms of Service and can get your account banned. This project was built for educational purposes. Use it at your own risk.

## Setup on Replit

1.  **Upload to Replit:** Upload this project's files to a new Node.js Repl on Replit.
2.  **Get Your Discord Token:**
    *   Open Discord in a web browser (not the desktop app).
    *   Press `Ctrl + Shift + I` to open Developer Tools.
    *   Go to the "Console" tab.
    *   Paste and run the following code. It will copy your token to the clipboard.
        ```javascript
        window.webpackChunkdiscord_app.push([
            [Symbol()],
            {},
            req => {
                if (!req.c) return;
                for (let m of Object.values(req.c)) {
                    try {
                        if (!m.exports || m.exports === window) continue;
                        if (m.exports?.getToken) return copy(m.exports.getToken());
                        for (let ex in m.exports) {
                            if (m.exports?.[ex]?.getToken && m.exports[ex][Symbol.toStringTag] !== 'IntlMessagesProxy') return copy(m.exports[ex].getToken());
                        }
                    } catch {}
                }
            },
        ]);
        window.webpackChunkdiscord_app.pop();
        console.log("Token copied to clipboard!");
        ```
3.  **Set the Token in Replit Secrets:**
    *   In your Replit project, go to the "Secrets" tab in the left sidebar (it looks like a padlock).
    *   Create a new secret. For the **key**, type `TOKEN`.
    *   For the **value**, paste the token you just copied.
    *   Click "Add new secret".
4.  **Install Dependencies & Run:**
    *   Go to the "Shell" tab in your Replit project.
    *   Run the command `npm install`.
    *   Once it finishes, click the main "Run ▶" button at the top. The bot should log in and print a confirmation message in the console.
5.  **Keep it online with UptimeRobot:**
    *   When you run the bot, Replit will show a webview with a URL at the top. Copy this URL.
    *   Go to [UptimeRobot](https://uptimerobot.com/), create a new "HTTP(s)" monitor, and paste the URL from your Repl. This will ping your bot regularly to keep it from falling asleep.

## How to Use

-   The bot only responds to commands from the Owner (you) or authorized Admins.
-   The default command prefix is `-`, which you can change in `config.json`.
-   Use the `-help` command in any server or DM to see your available commands.

## Core Commands

-   `-help`: Shows a dynamic list of commands you can use.
-   `-admins`: Lists the bot owner and all admins.
-   `-add <userID>`: (Owner-only) Adds a user as an admin.
-   `-remove <userID>`: (Owner-only) Removes an admin.
-   `-clone <sourceServerID> <targetServerID>`: (Owner-only) Clones a server's structure.
-   `-getkey <url>`: Attempts to find a key from a URL.