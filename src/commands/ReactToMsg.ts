import { getContentType } from '@adiwajshing/baileys';
import Command from './Command';
import type Client from '../Client';
import { ParsedData } from '../CommandHandler/Parser';
import isEmoji from '../utils/isEmoji';

export default class ReactToMsg implements Command {
  name = 'ReactToMsg';
  aliases = ['!reagir', '!react', '!rct'];
  description = '*!react <emoji>*\nMarque uma mensagem para reagir a ela.';

  async execute(data: ParsedData, client: Client) {
    const { hasQuotedMessage, message, from, splitedText } = data;

    if (!hasQuotedMessage) return;
    if (splitedText.length <= 1) return;

    const emoji = splitedText[1];

    if (!isEmoji(emoji)) return;

    const messageType = getContentType(message);

    // @ts-ignore
    const quotedId = message[messageType].contextInfo.stanzaId;
    // @ts-ignore
    const quotedMessage = await client.store.loadMessage(data.from, quotedId, client.socket).catch((err) => {
      console.log(err);
    });

    if (!quotedMessage) return;

    const reactionMessage = {
      react: {
        text: emoji,
        key: quotedMessage.key
      }
    };

    await client.socket.sendMessage(from, reactionMessage);
  }
}
