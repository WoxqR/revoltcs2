import express from 'express';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import Gamedig from 'gamedig';
import dotenv from 'dotenv';
dotenv.config();

// UPTIME: Express server (Render/Heroku/UptimeRobot için)
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Aktif'));
app.listen(PORT, () => console.log(`Uptime portu: ${PORT}`));

// Discord bot istemcisi
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once('ready', () => {
  console.log(`Bot giriş yaptı: ${client.user.tag}`);
  updateStatus(); // İlk çalıştır
  setInterval(updateStatus, 5000); // Her 5 saniyede bir güncelle
});

async function updateStatus() {
  try {
    const state = await Gamedig.query({
      type: 'csgo', // CS2 yerine 'csgo' kullanılıyor
      host: '185.193.165.11',
      port: 27015
    });

    const players = state.players.length;
    const maxPlayers = state.maxplayers;
    const map = state.map;
    const statusText = `🎯 ${players}/${maxPlayers} | ${map} haritasında yarışıyor`;

    client.user.setActivity(statusText, { type: 0 });
  } catch (error) {
    console.log('Sunucuya ulaşılamadı:', error.message);
  }
}

// !ip komutu
client.on('messageCreate', (message) => {
  if (message.content === '!ip') {
    message.reply({
      embeds: [{
        title: 'Jailbreak Sunucumuzun IP Adresi',
        description: '**`📌 IP:`**  `connect 185.193.165.11:27015`',
        image: {
          url: 'https://cdn.discordapp.com/attachments/1137360272441894962/1247518471491999774/37a31064-ae2d-46a9-9719-b8f72f5ac25c.png?ex=666f13d1&is=666dc251&hm=9e4f785b0c2755b2db1c258f5dd70aabfa2e81e10df25b7ff0210aa9f021d37f&' // senin gönderdiğin görsel
        },
        color: 0x00ff99
      }]
    });
  }
});

client.login(process.env.TOKEN);
