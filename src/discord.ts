import {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    DMChannel
} from 'discord.js'

import { getBotCompletionResponse, clearConversation } from './conversation';

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
        this.client.on('messageCreate', (message) => this.handleMessage(message, this.client.user));
        this.client.once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        });
    }

    init() {
        // init bot
        console.log('init discord bot....')
        this.client.login(process.env.DISCORD_BOT_TOKEN);
    }


    // listen to all messages
    async handleMessage(message, discordBotuser) {
        const isDM = (message.channel instanceof DMChannel)
        // ignore bot messages and messages without content
        if (message.author.bot || !message.content) return;

        // only respond to messages that @mention the bot user or direct messages to the bot
        if (!message.mentions.has(discordBotuser) && !isDM) return;

        // remove the @mention from the message content
        if (!isDM) {
            message.content = message.content.replace(`<@${discordBotuser?.id}>`, '').trim();
        }

        // cache the user's id so we can keep track of the bot's conversation with them
        const userId = message.author.id as string;

        // clear the conversation if the user types !clear
        if(message.content === '!clear'){
            await clearConversation(userId);
            return message.reply('Conversation cleared ' + message.author.username + '!');
        }


        // ask the assistant for a response
        const response = await getBotCompletionResponse(message, userId);

        // send the response to the user
        await message.reply(response);

    }

}