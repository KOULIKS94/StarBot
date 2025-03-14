const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const SESSION_DIR = './sessions';

// Ensure the session directory exists
if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR);
}

// Function to create a new client for a user
const createClient = (sessionId) => {
    const sessionPath = path.join(SESSION_DIR, sessionId);
    const client = new Client({
        authStrategy: new LocalAuth({ dataPath: sessionPath })
    });

    client.on('qr', qr => {
        console.log(`Scan this QR for session ${sessionId}:`);
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log(`✅ Session ${sessionId} is ready!`);
    });

    client.on('message', async msg => {
        if (msg.body === '!ping') {
            msg.reply('Pong!');
        }
    });

    client.initialize();
    return client;
};

// Manage multiple sessions
const sessions = {};

// Handle user login with `!start <phone_number>`
const globalClient = new Client({ authStrategy: new LocalAuth() });

globalClient.on('message', async msg => {
    const chatId = msg.from;
    const message = msg.body.trim();

    if (message.startsWith('!start ')) {
        const phoneNumber = message.split('918293316242')[1];

        if (!phoneNumber || isNaN(phoneNumber)) {
            return globalClient.sendMessage(chatId, '⚠️ Please enter a valid phone number.\nExample: !start 1234567890');
        }

        if (!sessions[phoneNumber]) {
            sessions[phoneNumber] = createClient(phoneNumber);
            globalClient.sendMessage(chatId, `🔗 Starting session for *${phoneNumber}*...`);
        } else {
            globalClient.sendMessage(chatId, `✅ Session for *${phoneNumber}* is already active.`);
        }
    }
});

globalClient.initialize();
