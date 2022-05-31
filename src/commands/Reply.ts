import Client from '../Client';
import { Command, ParsedData } from '../Types';

export default class Reply implements Command {
  name = 'Reply';
  aliases = ['!reply'];
  description = '';
  ownerOnly = true;

  static info = {
    name: 'Reply',
    aliases: ['!reply'],
    description: '',
    ownerOnly: true
  };

  async execute(data: ParsedData, _: Client): Promise<void> {
    const { splitedText } = data;

    await data.reply({ text: splitedText.slice(1).join(' ') });
  }
}
