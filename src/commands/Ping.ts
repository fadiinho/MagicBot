import type Client from '../Client';
import { ParsedData, Command } from '../structures';

export const info = {
  name: 'Ping',
  aliases: ['!ping'],
  description: '',
  ownerOnly: true
};

export default class Ping implements Command {
  info = info;
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
