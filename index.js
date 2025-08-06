import express from 'express';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import Gamedig from 'gamedig';

const app = express();
const PORT = process.env.PORT || 3000;

// Render & UptimeRobot için basit web sunucusu
app.get('/', (req, res) => {
  res.send('Bot çalışıyor!');
});

app.listen(PORT, () => {
  console.log(`UptimeRobot için Express sunucusu ${PORT} portunda aktif.`);
});

// Discord bot başlat
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const IP = '185.193.165.11';
const PORT_GAME = 27015;

client.once('ready', () => {
  console.log(`Bot giriş yaptı: ${client.user.tag}`);

  setInterval(async () => {
    try {
      const state = await Gamedig.query({
        type: 'csgo', // CS2 henüz desteklenmiyor
        host: IP,
        port: PORT_GAME,
      });

      const oyuncuSayisi = state.players.length;
      const maxOyuncu = state.maxplayers;
      const harita = state.map;

      client.user.setActivity(`🎯 ${oyuncuSayisi}/${maxOyuncu} | ${harita} yarışmasında yarışıyor`, {
        type: ActivityType.Competing,
      });

    } catch (error) {
      console.log('Sunucuya ulaşılamadı:', error.message);

      client.user.setActivity(`🟥 Sunucuya ulaşılamıyor`, {
        type: ActivityType.Watching,
      });
    }
  }, 5000);
});

client.login(process.env.TOKEN);
