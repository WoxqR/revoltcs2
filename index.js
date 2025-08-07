import express from 'express';
import { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } from 'discord.js';
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

// Slash komutlarını kayıt et
const commands = [
  new SlashCommandBuilder()
    .setName('aktif')
    .setDescription('Sunucu aktif mesajı gönderir')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once('ready', async () => {
  console.log(`Bot giriş yaptı: ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('✅ Slash komutları yüklendi.');
  } catch (error) {
    console.error('Komut yükleme hatası:', error);
  }

  updateStatus();
  setInterval(updateStatus, 5000);
});

async function updateStatus() {
  try {
    const state = await Gamedig.query({
      type: 'csgo',
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
          url: 'https://cdn.discordapp.com/attachments/1137360272441894962/1247518471491999774/37a31064-ae2d-46a9-9719-b8f72f5ac25c.png?ex=666f13d1&is=666dc251&hm=9e4f785b0c2755b2db1c258f5dd70aabfa2e81e10df25b7ff0210aa9f021d37f&'
        },
        color: 0x00ff99
      }]
    });
  }
});

// /aktif komutu (rol kontrolü dahil)
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'aktif') {
    const allowedRoleId = 'ROL_ID_HERE'; // 🔁 BU SATIRI KENDİ ROL ID'N İLE DEĞİŞTİR

    if (!interaction.member.roles.cache.has(allowedRoleId)) {
      return interaction.reply({
        content: '❌ Bu komutu kullanmak için yetkin yok.',
        ephemeral: true
      });
    }

    await interaction.reply({
      content: `@everyone\n<a:KonfetiGif:1346882004460765286> **Sunucumuz Aktif!** <a:KonfetiGif:1346882004460765286>\n` +
               `***__Sunucumuz aktif durumuna geçmiş bulunmaktadır. Tüm oyuncularımızı servera bekliyoruz.__***\n\n` +
               `<:1338171592655769610:1346749490106994699>・ **IP:** \`connect 185.193.165.11:27015\`\n` +
               `🗺️ ・ **Harita:** \`jb_revolt_piramit\`\n` +
               `<:1200799093451145246:1346749474357121037> ・ **Aktif Oyuncu Sayısı:** \`1/32\`\n\n` +
               `https://cdn.discordapp.com/attachments/1379099449401278464/1402737267264454779/static.png`,
      allowedMentions: { parse: ['everyone'] }
    });
  }
});

client.login(process.env.TOKEN);
