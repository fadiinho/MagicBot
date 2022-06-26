import Client from '../Client';
import { Command, ParsedData } from '../structures';


export default class Commands implements Command {
  info = {
    name: 'Commands',
    aliases: ['!commands', '!comandos'],
    description: 'Comando para ver todos os comandos.',
    help: '*!comandos*'
  };

  execute(data: ParsedData, client: Client): void {
    const commands = client.handler.commands;

    let text = '*Ｃｏｍａｎｄｏｓ Ｄｉｓｐｏｎíｖｅｉｓ:*';

    commands.forEach((item) => {
      const { description, help } = item.info;
      if (description) {
        text += '\n\n' + help
        text += '\n' + description;
      }
    });

    data.reply({ text: text });
  }
}
