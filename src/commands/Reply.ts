import Client from '../Client';
import { Command, ParsedData } from '../Types';

export default class Reply implements Command {
  name = 'Reply';
  aliases = ['!reply'];
  description = 'Command to reply a message.';

  async execute(data: ParsedData, _: Client): Promise<void> {
    const { splitedText } = data;

    await data.reply({ text: splitedText.slice(1).join(' ') });
  }
}
