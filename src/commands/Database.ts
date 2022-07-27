import Client from '../Client';
import { Command, ParsedData } from '../structures';
import { prefix } from '../config/global.json';
import { Arg, ParsedArgs, parse } from '../utils';
import { isJidGroup, jidDecode } from '@adiwajshing/baileys';

const args: Arg[] = [{
    name: 'allJids',
    argsRequired: false,
    default: false,
    description: 'Ver todos os jids do banco de dados.'
  }, {
    name: 'delete',
    argsRequired: false,
    default: false,
    description: 'Deleta alguma coisa do banco de dados.',
    subCommands: [{
      name: 'messages',
      default: true,
      argsRequired: true,
      pattern: /\d*@g.us|s.whatsapp.net/
    }]
  }
];

export default class Database implements Command {
  info = {
    name: 'Database',
    aliases: ['db', 'database'],
    description: 'Comando para fazer operações no banco de dados.',
    help: `*${prefix}db* <option>`,
    ownerOnly: true,
    args
  }

  async _allJids(data: ParsedData, _args: ParsedArgs, client: Client) {
    const jidsArray = await client.store.getAllMessagesJids();
    const jids = jidsArray.map(_jid => `${jidDecode(_jid).user} → *${isJidGroup(_jid) ? 'grupo' : 'contato'}*`).join('\n');

    data.reply({ text: jids});
  }

  async _delete(data: ParsedData, args: ParsedArgs, client: Client) {
    if (args.matchedSubCommand.error) {
      data.reply({ text: args.matchedSubCommand.errorMessage });
      return;
    }

    if (args.matchedSubCommand?.name && args.matchedSubCommand.name === 'messages') {
      const result = await client.store.deleteAllMessagesFromContact(args.matchedSubCommand.matchedArg as string);
      if (result.acknowledged) {
        data.reply({ text: `${args.matchedSubCommand.matchedArg} deletado com scesso.`});
        return;
      }

      data.reply({ text: `Algo deu errado ao tentar deletar ${args.matchedSubCommand.matchedArg}.`});

      return;
    }
  }

  execute(data: ParsedData, client: Client): void {
    const { text } = data;

    const args = parse(text, this.info.args);

    if (args.error) {
      data.reply({ text: args.errorMessage });
      return;
    }

    this[`_${args.name}`](data, args, client);
  }
}
