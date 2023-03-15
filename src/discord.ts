import {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    DMChannel
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
        const isDM = (message.channel instanceof DMChannel)
        // ignore bot messages and messages without content
        if (message.author.bot || !message.content) return;

        // only respond to messages that @mention the bot user or direct messages to the bot
        if (!message.mentions.has(this.client.user) && !isDM) return;

        // remove the @mention from the message content
        if (!isDM) {
            message.content = message.content.replace(`<@!${this.client.user?.id}>`, '').trim();
        }

        // get the bot's response
        const response = await getCompletion(message.content)

        await message.reply(response);
     
    }
}