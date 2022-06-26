import Client from '../Client';
import { Command, ParsedData } from '../structures';
import * as commands from './';

export const info = {
  name: 'Commands',
  aliases: ['!commands', '!comandos'],
  description: 'Comando para ver todos os comandos.',
  help: '*!comandos*'
};

export default class Commands implements Command {
  info = info;

  execute(data: ParsedData, __: Client): void {
    const keys = Object.keys(commands);
    let text = '*Ｃｏｍａｎｄｏｓ Ｄｉｓｐｏｎíｖｅｉｓ:*';

    keys.forEach((k) => {
      const { description, help } = commands[k].info;
      if (description) {
        text += '\n\n' + help
        text += '\n' + description;
      }
    });

    data.reply({ text: text });
  }
}
