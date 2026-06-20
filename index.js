import express from 'express';
import { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } from 'discord.js';
import Gamedig from 'gamedig';
import dotenv from 'dotenv';
dotenv.config();

// ===== SUNUCU AYARLARI =====
const SERVER_HOST = '185.193.165.33';
const SERVER_PORT = 27015;
const SERVER_IP_TEXT = `${SERVER_HOST}:${SERVER_PORT}`;
const BOT_NAME = 'Nova';

// ===== UPTIME (Render/UptimeRobot) =====
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send(`${BOT_NAME} Aktif`));
app.listen(PORT, () => console.log(`Uptime portu: ${PORT}`));

// ===== Discord bot istemcisi =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once('ready', async () => {
  console.log(`${BOT_NAME} giriş yaptı: ${client.user.tag}`);
  updateStatus();
  setInterval(updateStatus, 30000); // 5sn -> 30sn (Discord rate limit'e takılmamak için)
  await registerSlashCommand();
});

// ===== Durumu güncelleyen fonksiyon =====
async function updateStatus() {
  try {
    const state = await Gamedig.query({
      type: 'csgo',
      host: SERVER_HOST,
      port: SERVER_PORT
    });
    const players = state.players.length;
    const maxPlayers = state.maxplayers;
    const map = state.map;
    const statusText = `🎯 ${players}/${maxPlayers} | ${map} haritasında oynanıyor`;
    client.user.setActivity(statusText, { type: 0 });
  } catch (error) {
    console.log('Sunucuya ulaşılamadı:', error.message);
    client.user.setActivity('🔴 Sunucu kapalı', { type: 0 });
  }
}

// ===== !ip komutu =====
client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (message.content === '!ip') {
    message.reply({
      embeds: [
        {
          title: 'Jailbreak Sunucumuzun IP Adresi',
          description: `**\`📌 IP:\`**  \`connect ${SERVER_IP_TEXT}\``,
          image: {
            url: 'https://cdn.discordapp.com/attachments/1137360272441894962/1247518471491999774/37a31064-ae2d-46a9-9719-b8f72f5ac25c.png'
          },
          color: 0x00ff99,
          footer: { text: BOT_NAME }
        }
      ]
    });
  }
});

// ===== /aktif komutu (Slash) =====
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'aktif') {
    try {
      const state = await Gamedig.query({
        type: 'csgo',
        host: SERVER_HOST,
        port: SERVER_PORT
      });
      const players = state.players.length;
      const maxPlayers = state.maxplayers;
      await interaction.reply({
        content: `@here\n<a:tada:1346882004460765286> **Sunucumuz Aktif!** <a:tada:1346882004460765286>\n***__Sunucumuz aktif durumuna geçmiş bulunmaktadır. Tüm oyuncularımızı servera bekliyoruz.__***\n\n・ **IP:** \`connect ${SERVER_IP_TEXT}\`\n🗺️ ・ **Harita:** \`${state.map}\`\n ・ **Aktif Oyuncu Sayısı:** \`${players}/${maxPlayers}\``,
        allowedMentions: { parse: ['everyone', 'users', 'roles'], repliedUser: false }
      });
    } catch (error) {
      await interaction.reply({
        content: 'Sunucu bilgileri alınamadı. Belki şu anda kapalıdır.',
        ephemeral: true
      });
    }
  }
});

// ===== Slash komutu Discord'a kaydet =====
async function registerSlashCommand() {
  const commands = [
    new SlashCommandBuilder()
      .setName('aktif')
      .setDescription('Sunucunun aktif olduğunu herkese duyurur.')
  ].map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('/aktif komutu başarıyla yüklendi.');
  } catch (error) {
    console.error('Slash komutu yüklenemedi:', error);
  }
}

client.login(process.env.TOKEN);
