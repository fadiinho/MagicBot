import Client from '../Client';
import { ParsedData } from '../CommandHandler/Parser';
import Command from './Command';

export default class Ping implements Command {
  name = 'Ping';
  aliases = ['!ping'];
  description = 'Ping command';

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
