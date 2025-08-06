import express from 'express';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import Gamedig from 'gamedig';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot aktif 🚀');
});

app.listen(port, () => {
  console.log(`🌐 Express sunucusu çalışıyor: http://localhost:${port}`);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const serverIP = '185.193.165.11';
const serverPort = 27015;
const sunucuMap = 'jb_nova_piramit';

const DISCORD_TOKEN = process.env.TOKEN;

client.once('ready', () => {
  console.log(`✅ Bot giriş yaptı: ${client.user.tag}`);
  updateStatus();
  setInterval(updateStatus, 5000);
});

async function updateStatus() {
  try {
    const state = await Gamedig.query({
      type: 'csgo', // CS2 henüz desteklenmiyor
      host: serverIP,
      port: serverPort
    });

    const playerCount = state.players.length;
    const maxPlayers = state.maxplayers;

    const activityText = `🎯 ${playerCount}/${maxPlayers} | ${sunucuMap} oynuyor`;

    client.user.setPresence({
      activities: [{ name: activityText, type: ActivityType.Playing }],
      status: 'online'
    });

  } catch (error) {
    console.log('❌ Sunucuya ulaşılamadı:', error.message);
    client.user.setPresence({
      activities: [{ name: 'Sunucuya ulaşılamadı', type: ActivityType.Watching }],
      status: 'idle'
    });
  }
}

client.login(DISCORD_TOKEN);

