// Import the necessary Discord.js classes
const { Client, Intents, Interaction } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Create a new Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, log a message to the console
client.once('ready', () => {
    console.log('Ready!');
});

// Register a new slash command
const commands = [
  {
    name: 'ping',
    description: 'Ping the bot'
  },
  {
    name: 'hello',
    description: 'Say hello to the bot'
  }
];
const rest = new REST({ version: '9' }).setToken('your-bot-token');
(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands('your-client-id', 'your-guild-id'),
      { body: commands }
    );
    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Handle slash command interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  } else if (interaction.commandName === 'hello') {
    await interaction.reply(`Hello, ${interaction.user}!`);
  }
});

// Log in to Discord with your bot token
client.login('your-bot-token');