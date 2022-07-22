import Client from '../Client';
import { Command, ParsedData } from '../structures';
import { parse } from '../utils';
import { prefix } from '../config/global.json';

export default class Help implements Command {
  info = {
    name: 'help',
    aliases: ['help', 'ajuda'],
    description: 'Comando para ver ajuda de outro comando.',
    help: '*!ajuda <comando>*',
    args: [
      {
        name: 'help',
        default: true,
        description: 'Ver ajuda.',
        argsRequired: true,
      }
    ]
  };

  _help(data: ParsedData, command: Pick<Command, 'info'>) {
    let txt = command.info.help;
    txt += `\n_aliases: ${command.info.aliases.join(', ')}_`;
    txt += command.info.description ? `\n_description: ${command.info?.description}_` : '';

    if (command.info.args) {
      command.info.args.forEach((arg) => {
        if (arg.description) {
          txt += `\n\nopção:*(${arg.name})* ${arg.default ? '_[default]_' : ''}`
          txt += `\n${arg.description}`
        }
      });
    }

    data.reply({ text: txt });

  }

  execute(data: ParsedData, client: Client): void {
    const { text } = data;

    const args = parse(text, this.info.args);

    if (args.error) {
      data.reply({ text: args.errorMessage });
      return;
    }

    const command = client.handler.get(args.matchedArg as string);

    if (!command) {
      data.reply({ text: `Comando não encontrado.\nDigite ${prefix}comandos para ver todos os comandos.`});
      return;
    }

    this._help(data, command);
  }
}
