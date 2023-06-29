import "dotenv/config";
import Client from './Client';
import CommandHandler from './CommandHandler';
import './services/server'

const handler = new CommandHandler();

const client = new Client(handler);

client.init();

client.onMessage((data) => handler.handleMessage(data, client));

client.onChatUpdate((chat) => {
  console.log('Chat update');
  console.log(chat);
});

