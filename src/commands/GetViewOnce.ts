import { downloadContentFromMessage, getContentType, proto } from '@adiwajshing/baileys';
import type Client from '../Client';
import { ParsedData, Command } from '../structures';


export default class GetViewOnce implements Command {
  info = {
    name: 'GetViewOnce',
    aliases: ['getvo', 'getviewonce'],
    description: `Comando para pegar a mídia da mensagem única.`,
    help: '*!getvo*'
  };

  async execute(data: ParsedData, _client: Client) {
    const { hasQuotedMessage } = data;

    if (!hasQuotedMessage) return;
    const quotedMessage = await data.getQuotedMessage() as ParsedData;

    if (!quotedMessage.isViewOnce) return;

    const viewOnceMessage = quotedMessage.message.viewOnceMessage.message;
    const mediaType = getContentType(viewOnceMessage);
    let media: proto.Message.IImageMessage | proto.Message.IVideoMessage;

    if (mediaType === 'imageMessage') {
      media = viewOnceMessage.imageMessage;
    } else if (mediaType === 'videoMessage') {
      media = viewOnceMessage.videoMessage;
    } else {
      return;
    }

    const stream = await downloadContentFromMessage(media, mediaType === 'imageMessage' ? 'image' : 'video');
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    if (mediaType === 'imageMessage') {
      data.reply({ image: buffer });
    } else {
      data.reply({ video: buffer });
    }
  }
}
