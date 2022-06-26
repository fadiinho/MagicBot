import Client from '../Client';
import { Command, ParsedData } from '../structures';



export default class Reply implements Command {
  info = {
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
