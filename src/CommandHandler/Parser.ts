import dotenv from 'dotenv';
dotenv.config();

import { WAMessage, getContentType, isJidGroup } from '@adiwajshing/baileys';
import { isMedia } from '../utils';
import type Client from '../Client';
import { ParsedData } from '../Types';

const config = {
  prefix: process.env.PREFIX ? process.env.PREFIX : '!'
};

export default async function parse(data: WAMessage, client: Client) {
  const message = data.message;

  if (!message) return null;

  const type = getContentType(message);

  const mentions = type === 'extendedTextMessage' ? message.extendedTextMessage.contextInfo.mentionedJid : null;

  const text = type === 'extendedTextMessage' ? message.extendedTextMessage.text : message.conversation;
  const splitedText = text.split(' ');
  const command = splitedText[0];

  const parsedData: ParsedData = {
    messageInfo: data,
    message: data.message,
    text,
    splitedText,
    mentions,
    messageLength: text.length,
    command,
    id: data.key.id,
    from: data.key.remoteJid,
    fromMe: data.key.fromMe,
    participant: data.key.participant,
    messageType: type,
    hasQuotedMessage:
      type === 'extendedTextMessage' && message.extendedTextMessage.contextInfo.quotedMessage ? true : false,
    isGroup: isJidGroup(data.key.remoteJid),
    hasMedia: isMedia(type),
    isCommand: command.startsWith(config.prefix),
    isViewOnce: type === 'viewOnceMessage',
    getMedia: function () {
      if (!this.hasMedia) return null;

      return this.message[this.messageType];
    },
    getGroupMetadata: async function () {
      if (!this.isGroup) return;

      return await client.socket.groupMetadata(this.from);
    },
    getQuotedMessage: async function (): Promise<ParsedData | null> {
      const quotedId = this.hasMedia
        ? this.message[this.messageType].contextInfo?.stanzaId
        : this.message?.extendedTextMessage?.contextInfo?.stanzaId;

      if (!quotedId) return null;

      // @ts-ignore
      const _q = await client.store.loadMessage(this.from, quotedId, client.socket).catch((err) => {
        throw new Error(err.message);
      });
      const quotedMessage = _q ? await parse(_q, client) : null;

      return quotedMessage;
    },
    reply: async function (content) {
      const response = client.socket.sendMessage(this.from, content, { quoted: this.messageInfo });
      return response;
    }
  };

  return parsedData;
}
