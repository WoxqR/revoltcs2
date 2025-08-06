import express from 'express';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import Gamedig from 'gamedig';

// ==== Express (keep alive) ====
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot Aktif!');
});

app.listen(port, () => {
  console.log(`✅ Express sunucusu http://localhost:${port} üzerinde çalışıyor`);
});

// ==== Bot Ayarları ====
const token = process.env.TOKEN;
const serverIP = '185.193.165.11';   // sunucu IP
const serverPort = 27015;            // varsayılan CS port
const sunucuMap = 'jb_revolt_piramit';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ==== Discord Bot Olayı ====
client.once('ready', () => {
  console.log(`🤖 Bot giriş yaptı: ${client.user.tag}`);
  updateStatus();
  setInterval(updateStatus, 5000); // 5 saniyede bir durum güncelle
});

// ==== Durum Güncelleme ====
let lastPlayerCount = 0;
let lastMaxPlayers = 32;

async function updateStatus() {
  try {
    const state = await Gamedig.query({
      type: 'csgo', // CS2 için hâlâ csgo kullanılmalı
      host: serverIP,
      port: serverPort
    });

    lastPlayerCount = state.players.length;
    lastMaxPlayers = state.maxplayers;

    const activityText = `🎯 ${lastPlayerCount}/${lastMaxPlayers} | ${sunucuMap} yarışmasında yarışıyor`;

    client.user.setPresence({
      activities: [{ name: activityText, type: ActivityType.Playing }],
      status: 'online'
    });

  } catch (error) {
    console.log('❌ Sunucuya ulaşılamadı, önceki değerler gösteriliyor:', error.message);

    const activityText = `🎯 ${lastPlayerCount}/${lastMaxPlayers} | ${sunucuMap} yarışmasında yarışıyor`;

    client.user.setPresence({
      activities: [{ name: activityText, type: ActivityType.Playing }],
      status: 'idle'
    });
  }
}

// ==== Botu Başlat ====
client.login(token);
