import { Command, ParsedData } from '../structures';
import { prefix } from '../config/global.json';
import Client from '../Client';
import { parse, Arg, logger, ParsedArgs } from '../utils';

import { getUser, getTotalFollowersCount, getEmotes } from '../services/twitch';
import axios from 'axios';

const args: Arg[] = [
  {
    name: 'info',
    description: 'Ver informações.',
    default: true,
    argsRequired: true
  },
  {
    name: 'emotes',
    description: 'Ver emotes de um canal',
    default: false,
    argsRequired: true,
    subCommands: [
      {
        name: 'download',
        description: 'Baixar emotes de um canal',
        default: false,
        argsRequired: true
      }
    ]
  }
];

export default class Twitch implements Command {
  info = {
    name: 'twitch',
    aliases: ['twitch', 'tw'],
    description: 'Ver informações de um canal da twitch',
    help: `*${prefix}twitch* (opções) <username>`,
    args: args
  };

  async _info(data: ParsedData, args: ParsedArgs) {
    const matchedArgs = args.matchedArg as string;

    const user = await getUser(matchedArgs);

    const response = await axios.get(user.profilePictureUrl, {
      responseType: 'arraybuffer'
    });

    const image = response.data;

    const caption = `*Username:* ${user.displayName}\n*Description:* ${
      user.description
    }\n*Total Followers:* ${await getTotalFollowersCount(user.name)}`;

    data.reply({ image, caption });
  }

  async getEmotes(userName: string) {
    const user = await getUser(userName);

    const emotes = await getEmotes(user.name);
    const emotesObj: { emote: string; url: string }[] = [];


    emotes.forEach((emote) => {
      emotesObj.push({ emote: emote.name, url: emote.getImageUrl(4) })
    });

    return emotesObj;
  }

  async emoteDownload(data: ParsedData, args: string[]) {
    const emotes = await this.getEmotes(args[0]);
    const emote = emotes.find(_emote => _emote.emote === args[1]);

    if (!emote) {
      data.reply({ text: `Emote ${args[1]} não encontrado.\nDigite "${prefix}tw emotes *user*" para ver todos os emotes de um usuário.`});
      return;
    }

    const response = await axios(emote.url, {
      responseType: 'arraybuffer'
    }).catch((err) => console.log(err.message));

    if (!response) {
      data.reply({ text: 'Ocorreu um erro ao tentar baixar o emote.'});
      return;
    }

    const downloadedEmote = response.data;

    data.reply({ sticker: downloadedEmote});
  }

  async _emotes(data: ParsedData, args: ParsedArgs) {
    const matchedArg: string = args.matchedArg as string;

    if (args.matchedSubCommand?.name && args.matchedSubCommand.name === 'download') {
      this.emoteDownload(data, [matchedArg, args.matchedSubCommand.matchedArg as string]);
      return;
    }

    const emotes = await this.getEmotes(matchedArg);

    data.reply({ text: emotes.map((emote) => emote.emote).join('\n')});
  }

  execute(data: ParsedData, _client: Client): void {
    const { text } = data;

    const args = parse(text, this.info.args);

    if (args.error) {
      data.reply({ text: args.errorMessage });
      return;
    }

    this[`_${args.matchedCommand.name}`](data, args)
  }
}
