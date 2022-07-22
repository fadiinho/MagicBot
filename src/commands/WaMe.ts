import { Command, ParsedData } from '../structures';
import { prefix } from '../config/global.json';
import type Client from '../Client';

import { parse, ParsedArgs } from '../utils';

export default class WaMe implements Command {
  info = {
    name: 'wame',
    aliases: ['wame'],
    description: 'Gere um link https://wa.me',
    help: `*${prefix}wame* <(53)91234-5678>`,
    args: [
      {
        name: 'numero',
        description: 'Número para gerar o link.',
        default: true,
        argsRequired: true,
        pattern: /^\([1-9]{2}\)(?:[2-8]|9[1-9])[0-9]{3}\-[0-9]{4}$/
      }
    ]
  };

  constructor() {
    this.info.args.forEach((item) => {
      Object.assign(item, { run: eval(`this._${item.name}`) });
    });
  }

  _numero(data: ParsedData, args: ParsedArgs) {
    let number: string = (args.matchedArg as string).replace(/\D/g, '');

    if (number.length === 11) {
      number = '55' + number;
    }

    data.reply({ text: `https://wa.me/${number}`, linkPreview: null }, {});
  }

  execute(data: ParsedData, _client: Client) {
    const { text } = data;
    const args = parse(text, this.info.args);

    if (args.error) {
      data.reply({ text: args.errorMessage });
      return;
    }

    this[`_${args.matchedCommand.name}`](data, args)
  }
}
