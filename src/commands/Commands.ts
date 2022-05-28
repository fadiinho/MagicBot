import Client from '../Client';
import { Command, ParsedData } from '../Types';
import commands from './';

export default class Commands implements Command {
  name = 'Commands';
  aliases = ['!commands', '!comandos'];
  description = '*!comandos*\nComando para ver todos os comandos.';

  static info = {
    name: 'Commands',
    aliases: ['!commands', '!comandos'],
    description: '*!comandos*\nComando para ver todos os comandos.'
  };

  execute(data: ParsedData, __: Client): void {
    const keys = Object.keys(commands);
    let text = '*Ｃｏｍａｎｄｏｓ Ｄｉｓｐｏｎíｖｅｉｓ:*';

    keys.forEach((k) => {
      const { name, description } = commands[k].info;
      if (['Reply', 'Ping'].includes(name)) return; // Temporary until implement Inhibitor
      text += '\n\n' + description;
    });

    data.reply({ text: text });
  }
}
