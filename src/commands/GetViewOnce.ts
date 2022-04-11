import { downloadContentFromMessage, getContentType } from '@adiwajshing/baileys';
import Command from './Command';
import type Client from '../Client';
import { ParsedData } from '../CommandHandler/Parser';

export default class GetViewOnce implements Command {
  name = 'GetViewOnce';
  aliases = ['!getvo', '!getviewonce'];
  description = `*!getvo*\nComando para pegar a mídia da mensagem única`;

  async execute(data: ParsedData, client: Client) {
    const { hasQuotedMessage, quotedMessage, from, messageInfo } = data;

    if (!hasQuotedMessage && !quotedMessage) return;
    if (!quotedMessage.viewOnceMessage) return;

    const mediaType = getContentType(quotedMessage.viewOnceMessage.message);

    const viewOnceMessage =
      quotedMessage.viewOnceMessage.message.imageMessage || quotedMessage.viewOnceMessage.message.videoMessage;

    const stream = await downloadContentFromMessage(viewOnceMessage, mediaType === 'imageMessage' ? 'image' : 'video');

    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    client.socket.sendMessage(
      from,
      {
        image: buffer
      },
      {
        quoted: messageInfo
      }
    );
  }
}
