import Client from './Client';
import CommandHandler from './CommandHandler';
import twitch from './services/twitch';

const handler = new CommandHandler();

const client = new Client(handler);

client.init();

client.onMessage((data) => handler.handleMessage(data, client));

client.onChatUpdate((chat) => {
  console.log(chat);
});

twitch();
