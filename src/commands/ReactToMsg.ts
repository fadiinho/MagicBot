import { getContentType } from '@adiwajshing/baileys';
import type Client from '../Client';
import { ParsedData, Command } from '../structures';
import { isEmoji } from '../utils';

export const info = {
  name: 'ReactToMsg',
  aliases: ['!reagir', '!react', '!rct'],
  description: '',
  ownerOnly: true
};

export default class ReactToMsg implements Command {
  info = info;

  async execute(data: ParsedData, client: Client) {
    const { hasQuotedMessage, message, splitedText } = data;

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

    await client.reactToMsg(quotedMessage.key, { emoji });
  }
}
