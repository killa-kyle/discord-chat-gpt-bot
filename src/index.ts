import dotenv from 'dotenv'
dotenv.config()

import discordBot from './discord/discord'

// load an instance of our Bot class
const bot = new discordBot()

// start the bot
bot.init()
