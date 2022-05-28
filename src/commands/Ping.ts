import type Client from '../Client';
import { ParsedData, Command } from '../Types';

export default class Ping implements Command {
  name = 'Ping';
  aliases = ['!ping'];
  description = 'Ping command';

  static info = {
    name: 'Ping',
    aliases: ['!ping'],
    description: 'Ping command'
  };

  execute(data: ParsedData, client: Client): void {
    const { from, messageInfo } = data;

    client.socket.sendMessage(
      from,
      { text: 'Pong!' },
      {
        quoted: messageInfo
      }
    );
  }
}
