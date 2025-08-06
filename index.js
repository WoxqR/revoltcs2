import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import Gamedig from 'gamedig';
import dotenv from 'dotenv';

dotenv.config();

// Express Sunucusu (UptimeRobot için)
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Aktif!'));
app.listen(port, () => console.log(`Express çalışıyor: http://localhost:${port}`));

// Discord Bot Tanımı
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// Oyun sunucu bilgileri
const SERVER_IP = '185.193.165.109';
const SERVER_PORT = 27015;

// Sunucu durumunu Discord'daki botun durumuna yaz
async function updateStatus() {
  try {
    const state = await Gamedig.query({
      type: 'csgo',
      host: SERVER_IP,
      port: SERVER_PORT
    });

    const playerCount = state.players.length;
    const maxPlayers = state.maxplayers;
    const map = state.map;

    client.user.setPresence({
      activities: [{
        name: `🎯 ${playerCount}/${maxPlayers} | ${map}`,
        type: 0
      }],
      status: 'online'
    });
  } catch (error) {
    console.log('Sunucuya ulaşılamadı:', error.message);
    client.user.setPresence({
      activities: [{
        name: '🎯 Sunucu Kapalı',
        type: 0
      }],
      status: 'idle'
    });
  }
}

// Bot hazır olduğunda çalış
client.once('ready', () => {
  console.log(`Bot giriş yaptı: ${client.user.tag}`);
  updateStatus();
  setInterval(updateStatus, 5000); // 5 saniyede bir güncelle
});

// Komut dinleyici (!ip)
client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  const command = message.content.toLowerCase();

  if (command === '!ip') {
    message.reply({
      embeds: [{
        title: '**Jailbreak Sunucumuzun IP Adresi**',
        description: '```🖥️ IP: connect 185.193.165.11```',
        color: 0x2F3136,
        footer: {
          text: 'Revolt Durum'
        }
      }]
    });
  }
});

// Token ile giriş
client.login(process.env.TOKEN);

