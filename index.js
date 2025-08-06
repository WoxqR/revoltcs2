import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import Gamedig from 'gamedig';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const SERVER_IP = '185.193.165.11';
const SERVER_PORT = 27015;
const GAME_TYPE = 'csgo';

client.once('ready', () => {
  console.log(`Bot giriş yaptı: ${client.user.tag}`);

  setInterval(async () => {
    try {
      const state = await Gamedig.query({
        type: GAME_TYPE,
        host: SERVER_IP,
        port: SERVER_PORT,
      });

      const status = `🎯 ${state.players.length}/${state.maxplayers} | ${state.map}`;
      client.user.setPresence({
        activities: [{ name: status, type: ActivityType.Competing }],
        status: 'online',
      });

    } catch (error) {
      console.log("Sunucuya ulaşılamadı:", error.message);
    }
  }, 5000);
});

client.login(process.env.TOKEN);
