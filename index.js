import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import Gamedig from 'gamedig';

// Express ile web sunucusu kur (UptimeRobot için)
const app = express();
app.get('/', (req, res) => {
  res.send('Bot aktif ve çalışıyor!');
});
app.listen(3000, () => {
  console.log('Web sunucusu aktif (port 3000)');
});

// Discord bot ayarları
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`Bot giriş yaptı: ${client.user.tag}`);
  updateStatus(); // Durumu güncelle
  setInterval(updateStatus, 5000); // Her 5 saniyede bir tekrar et
});

// Sunucu durumunu güncelle
async function updateStatus() {
  try {
    const state = await Gamedig.query({
      type: 'csgo', // CS2 henüz desteklenmiyor
      host: '185.193.165.11',
      port: 27015
    });

    const players = `${state.players.length}/${state.maxplayers}`;
    const map = state.map;

    client.user.setPresence({
      activities: [{
        name: `🎯 ${players} | ${map} haritasında yarışıyor`,
        type: 0
      }],
      status: 'online'
    });

  } catch (error) {
    console.error('Sunucuya ulaşılamadı:', error.message);

    client.user.setPresence({
      activities: [{
        name: `Sunucuya ulaşılamıyor`,
        type: 0
      }],
      status: 'dnd'
    });
  }
}

