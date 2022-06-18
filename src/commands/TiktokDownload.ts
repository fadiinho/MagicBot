import axios from 'axios';
import { getVideoMeta } from 'tiktok-scraper';
import type Client from '../Client';
import { Command, ParsedData } from '../structures';
import { ArgsParser } from '../utils';

export const info = {
  name: 'tiktok',
  description: '*!tk (opções) <url>*\nBaixa um vídeo do tiktok',
  aliases: ['!tiktokdownload', '!ttdl', '!tiktokdl', '!tkdl', '!tk'],
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
      argsRequired: true,
      pattern: /^https:\/\/www\.tiktok\.com\/@[\w.-]+/
    }
  ]
};

export default class TiktokDownload implements Command {
  info = info;

  async download(url: string, data: ParsedData, client: Client) {
    const { messageInfo } = data;
    await client.reactToMsg(messageInfo.key, { emoji: '⏳' });

    const tiktok = await getVideoMeta(url);

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

  async execute(data: ParsedData, client: Client): Promise<void> {
    const {
      text
    } = data;

    const args = ArgsParser.parse(text, this.info.args);

    if (args.error === 'args required') {
      data.reply({
        text: 'Você precisa informar a url do vídeo.'
      });
      return;
    }

    switch (args.name) {
      case 'download':
        this.download(args.matchedArgs[0], data, client);
        break;
      default:
        break
    }
  }
}
