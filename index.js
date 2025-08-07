import express from 'express';
import { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } from 'discord.js';
import Gamedig from 'gamedig';
import dotenv from 'dotenv';
dotenv.config();

// UPTIME: Express server
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

// Sunucu durumu güncelleme
client.once('ready', async () => {
  console.log(`Bot giriş yaptı: ${client.user.tag}`);
  updateStatus();
  setInterval(updateStatus, 5000);
  await registerCommands(); // Slash komutlarını kaydet
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

// Slash komut kaydı
async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('aktif')
      .setDescription('Sunucu aktif duyurusu gönderir.')
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('/aktif komutu başarıyla yüklendi.');
  } catch (error) {
    console.error('Komut kaydı başarısız:', error);
  }
}

// Slash komut işlemleri
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'aktif') {
    try {
      const state = await Gamedig.query({
        type: 'csgo',
        host: '185.193.165.11',
        port: 27015
      });

      const players = state.players.length;
      const maxPlayers = state.maxplayers;
      const map = state.map;

      await interaction.reply({
        content: `@everyone\n<a:tada:1346882004460765286> **Sunucumuz Aktif!** <a:tada:1346882004460765286>\n***__Sunucumuz aktif durumuna geçmiş bulunmaktadır. Tüm oyuncularımızı servera bekliyoruz.__***\n・ **IP:** \`connect 185.193.165.11:27015\`\n🗺️ ・ **Harita:** \`${map}\`\n ・ **Aktif Oyuncu Sayısı:** \`${players}/${maxPlayers}\`\n\nhttps://cdn.discordapp.com/attachments/1400365334162309140/1402934398197698570/static_1.png?ex=6895b7f9&is=68946679&hm=f465bed7d2f9efe361b6ceddb844d701924bcde59ba4ff05a417ada5dbcd6931&`,
        allowedMentions: { parse: ['everyone'] }
      });
    } catch (error) {
      await interaction.reply({
        content: 'Sunucu bilgilerine ulaşılamadı.',
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);


