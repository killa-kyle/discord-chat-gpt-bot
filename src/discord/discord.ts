import { Client, GatewayIntentBits, Partials, Events, DMChannel, AttachmentBuilder } from 'discord.js'



import { getBotCompletionResponse, clearConversation } from '../conversation'
import { loadDocument } from '../dataLoader'
import { getEmbedding } from '../openAI'

export default class DisordBot {
    client: Client
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessages,
            ],
            partials: [Partials.Channel],
        })
        // handle message events
        this.client.on('messageCreate', message => this.handleMessage(message, this.client.user))
        this.client.once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`)
        })

    }

    init() {
        // init bot
        console.log('init discord bot....')
        this.client.login(process.env.DISCORD_BOT_TOKEN)
        // this.registerCommands()
    }



    // listen to all messages
    async handleMessage(message, discordBotuser) {
        const  messageAttachment = (message.attachments)
        if (messageAttachment) {
            const attachment = messageAttachment.first()
            const attachmentUrl = attachment?.url
        }
      

        const isDM = message.channel instanceof DMChannel
        // ignore bot messages and messages without content
        if (message.author.bot || !message.content) return

        // only respond to messages that @mention the bot user or direct messages to the bot
        if (!message.mentions.has(discordBotuser) && !isDM) return

        // remove the @mention from the message content
        if (!isDM) {
            message.content = message.content.replace(`<@${discordBotuser?.id}>`, '').trim()
        }

        // cache the user's id so we can keep track of the bot's conversation with them
        const userId = message.author.id as string

        // clear the conversation if the user types !clear
        if (message.content === '!clear') {
            await clearConversation(userId)
            return message.reply('Our conversation history has been cleared!')
        }

        // show the loading spinner
        const assistantReply = await message.reply('Thinking...')

        // ask the assistant for a response
        let response = await getBotCompletionResponse(message, userId)

        // handle long responses that exceed the discord message character limit
        if (response?.length >= 1990) {
            response = response.slice(0, 1990)
            response = `${response}...`
        }

        // send the response to the user
        return assistantReply.edit({
            content: response,
        })
    }
}
