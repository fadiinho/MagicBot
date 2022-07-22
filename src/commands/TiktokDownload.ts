import axios from 'axios';
import { getVideoMeta } from 'tiktok-scraper';
import type Client from '../Client';
import { Command, ParsedData } from '../structures';
import { parse, ParsedArgs } from '../utils';

export default class TiktokDownload implements Command {
  info = {
    name: 'tiktok',
    description: 'Baixa um vídeo do tiktok',
    aliases: ['tiktokdownload', 'ttdl', 'tiktokdl', 'tkdl', 'tk'],
    help: '*!tk (opções) <url>*',
    args: [
      {
        name: 'download',
        default: true,
        description: 'Baixe um vídeo do TikTok.',
        argsRequired: true,
        pattern: /^https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+/
      },
      {
        name: 'info',
        default: false,
        description: 'Mostra informações do vídeo ou usuário.',
        argsRequired: true
      }
    ]
  };

  async _download(data: ParsedData, args: ParsedArgs, client: Client) {
    const { messageInfo } = data;

    await client.reactToMsg(messageInfo.key, { emoji: '⏳' });

    const tiktok = await getVideoMeta(args.matchedArg as string);

    const { videoUrl, text, authorMeta } = tiktok.collector[0];

    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer'
    });

    const video = response.data;

    const msg = [
      `Título: ${text
        .split(' ')
        .filter((item) => !item.includes('#'))
        .join(' ')}`,
      `Username: ${authorMeta.name}`
    ].join('\n');

    await client.reactToMsg(messageInfo.key, { remove: true });
    await client.reactToMsg(messageInfo.key, { emoji: '✅' });
    data.reply({ caption: msg, video });
  }

  async _info(data: ParsedData, { args }) {
    console.log(args);
  }

  async execute(data: ParsedData, client: Client): Promise<void> {
    const {
      text
    } = data;

    const args = parse(text, this.info.args);

    if (args.error) {
      data.reply({ text: args.errorMessage });
      return;
    }

    this[`_${args.name}`](data, args, client)
  }
}
