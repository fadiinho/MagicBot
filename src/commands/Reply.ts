import Client from '../Client';
import { Command, ParsedData } from '../structures';

export const info = {
  name: 'Reply',
  aliases: ['!reply'],
  description: '',
  ownerOnly: true
};

export default class Reply implements Command {
  info = info;

  async execute(data: ParsedData, _: Client): Promise<void> {
    const { splitedText } = data;

    await data.reply({ text: splitedText.slice(1).join(' ') });
  }
}
