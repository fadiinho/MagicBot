import type Client from '../Client';
import { ParsedData, Command } from '../structures';


export default class Ping implements Command {
  info = {
    name: 'Ping',
    aliases: ['ping'],
    description: '',
    ownerOnly: true
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
