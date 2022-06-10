import axios from 'axios';
import { getVideoMeta } from 'tiktok-scraper';
import type Client from '../Client';
import { Command, ParsedData } from '../structures';

export default class TiktokDownload implements Command {
  name = 'tiktok';
  description = '*!tk (opções) <url>*\nBaixa um vídeo do tiktok';
  aliases = ['!tiktokdownload', '!ttdl', '!tiktokdl', '!tkdl', '!tk'];

  static info = {
    name: 'tiktok',
    description: '*!tk (opções) <url>*\nBaixa um vídeo do tiktok',
    aliases: ['!tiktokdownload', '!ttdl', '!tiktokdl', '!tkdl', '!tk']
  };

  async execute(data: ParsedData, client: Client): Promise<void> {
    const { splitedText, messageInfo } = data;

    if (splitedText.length < 2) {
      await data.reply({ text: 'Você precisa informar uma url!' });
      return;
    }

    await client.reactToMsg(messageInfo.key, { emoji: '⏳' });

    const tiktok = await getVideoMeta(splitedText[1]);

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
}
