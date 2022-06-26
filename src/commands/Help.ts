import Client from '../Client';
import { Command, ParsedData } from '../structures';
import { ArgsParser } from '../utils';

export default class Help implements Command {
  info = {
    name: 'help',
    aliases: ['!help', '!ajuda'],
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

  constructor() {
    this.info.args.forEach((item) => {
      Object.assign(item, { run: eval(`this._${item.name}`) });
    });
  }

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

    const args = ArgsParser.parse(text, this.info.args);

    if (args.error === 'args required') {
      data.reply({ text: 'Você precisa informar o nome do comando.' });
      return;
    };

    // TODO: Get prefix from config
    const command = client.handler.get('!' + args.matchedArgs[0]);

    if (!command) {
      data.reply({ text: 'Comando não encontrado' });
      return;
    };

    args.matchedCommand.run(data, command);
  }
}
