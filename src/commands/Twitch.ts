import { Command, ParsedData } from '../structures';
import { prefix } from '../config/global.json';
import Client from '../Client';
import { ArgsParser, logger } from '../utils';

import { getUser } from '../services/twitch';
import axios from 'axios';

export default class Twitch implements Command {
  info = {
    name: 'twitch',
    aliases: ['twitch', 'tw'],
    description: 'Ver informações de um canal da twitch',
    help: `*${prefix}twitch* <username>`,
    args: [{
      name: 'info',
      description: 'Ver informações.',
      default: true,
      argsRequired: true,
      subCommands: [{
        name: 'user',
        default: true,
        description: 'Ver informações de um usuário',
        argsRequired: true
      }]
    }]
  }

  constructor() {
    this.info.args.forEach((item) => {
      Object.assign(item, { run: eval(`this._${item.name}`) });
    });
  }

  async _info(data: ParsedData, ...args: any) {
    const matchedArgs = args[0]

    const user = await getUser(matchedArgs[0])

    const response = await axios.get(user.userPicture, {
      responseType: 'arraybuffer'
    });

    const image = response.data;

    

    data.reply({ image, caption: `username: ${user.userName}` })
  }

  execute(data: ParsedData, _client: Client): void {
    const { text } = data;
    const args = ArgsParser.parse(text, this.info.args);


    if (args.error === 'args required') {
      data.reply({ text: 'Você precisa informar um username.' })
      return;
    }

    logger.debug(args, 'ARGS DEBUG');
    args.matchedCommand.run(data, args.matchedArgs);
  }
}
