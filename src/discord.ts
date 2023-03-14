import {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
} from 'discord.js'
import { getCompletion } from './openAI';

export default class DisordBot {
    client: Client;
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessages,
            ],
            partials: [Partials.Channel]
        });
        // handle message events
        this.client.on('messageCreate', (message) => this.handleMessage(message));
        this.client.once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        });
    }

    init() {

        // init bot
        console.log('init discord bot')
        this.client.login(process.env.DISCORD_BOT_TOKEN);
    }


    // listen to all messages
    async handleMessage(message) {
        // ignore bot messages
        if (message.author.bot) return;

        if (message.content === 'ping') {
            return message.reply('Pong!');
        }

        const response = await getCompletion(message.content)
        let reply = response?.data.choices[0].message?.content.trim()

        await message.reply(reply);
    }
}