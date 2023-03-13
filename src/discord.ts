import {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
} from 'discord.js'

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
    async handleMessage(message) {
       
        if (message.content === 'ping') {
            await message.reply('Pong!');
        }
    }
}