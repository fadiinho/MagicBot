import { downloadContentFromMessage, getContentType, proto } from '@adiwajshing/baileys';
import type Client from '../Client';
import { ParsedData, Command } from '../Types';

export default class GetViewOnce implements Command {
  name = 'GetViewOnce';
  aliases = ['!getvo', '!getviewonce'];
  description = `*!getvo*\nComando para pegar a mídia da mensagem única`;

  async execute(data: ParsedData, client: Client) {
    const { hasQuotedMessage, from, messageInfo } = data;

    if (!hasQuotedMessage) return;
    const quotedMessage = await data.getQuotedMessage();

    if (!quotedMessage.isViewOnce) return;

    const viewOnceMessage = quotedMessage.message.viewOnceMessage.message;
    const mediaType = getContentType(viewOnceMessage);
    let media: proto.IImageMessage | proto.IVideoMessage;

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
      client.socket.sendMessage(
        from,
        {
          image: buffer
        },
        {
          quoted: messageInfo
        }
      );
    } else {
      client.socket.sendMessage(
        from,
        {
          video: buffer
        },
        {
          quoted: messageInfo
        }
      );
    }
  }
}
