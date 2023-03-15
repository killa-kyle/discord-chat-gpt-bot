import {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    DMChannel
} from 'discord.js'
import { getCompletion } from './openAI';
import {readDb, writeDb, getSimilarTextFromDb, getCurrentDateTime, encodeToSHA256, cosineSimilarity, createDb, clearJsonFile} from './db';
import crypto from 'crypto';
const DB_FOLDER = "./conversations";
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
            message.content = message.content.replace(`<@${this.client.user?.id}>`, '').trim();
        }

        // cache the user's id so we can keep track of the bot's conversation with them
        const userId = message.author.id as string;
        
        // create a new conversation for the user if one doesn't exist
        const USER_DB_PATH = `${DB_FOLDER}/${userId}`;
        await createDb(USER_DB_PATH);
        // read the conversation from the db
        const conversation = readDb(USER_DB_PATH);
        
        // get the parent message id if one exists from the conversation
        const parentMessageId = conversation[conversation?.length - 1]?.id || crypto.randomUUID();
     
        // add the user's message to the conversation
        const userMessage = {
            id: crypto.randomUUID(),
            parentMessageId,
            user: userId,
            role: "user",
            content: message.content,
            embedding: [],
            timestamp: getCurrentDateTime()
        }
        conversation.push(userMessage)

     
        // write the conversation to the db
        writeDb(conversation, USER_DB_PATH);
       

        // get the bot's response
        const response = await getCompletion(message.content)
        // add the bot's response to the conversation
        const botMessage = {
            id: crypto.randomUUID(),
            parentMessageId: userMessage.id,
            user: this.client.user?.id,
            role: "assistant",
            content: response,
            embedding: [],
            timestamp: getCurrentDateTime()
        }
        conversation.push(botMessage)

        console.log({conversation})
        // write the conversation to the db
        writeDb(conversation, USER_DB_PATH);
  
        await message.reply(response);

    }
}