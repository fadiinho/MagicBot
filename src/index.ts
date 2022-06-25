import Client from './Client';
import CommandHandler from './CommandHandler';

const handler = new CommandHandler({
  commandsDir: 'src/commands/'
});

const client = new Client(handler);

client.init();

client.onMessage((data) => handler.handleMessage(data, client));

client.onChatUpdate((chat) => {
  console.log(chat);
});
