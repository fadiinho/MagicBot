import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

import { WAMessage, getContentType, isJidGroup, downloadContentFromMessage, MinimalMessage } from '@adiwajshing/baileys';
import { isMedia, logger } from '../utils';
import type Client from '../Client';
import { ParsedData } from '../structures';

import globalConfig from '../config/global.json';

export default async function parse(data: WAMessage, client: Client) {
  const message = data.message;

  if (!message) return null;

  const type = getContentType(message);

  const mentions =
    type === 'extendedTextMessage' && message.extendedTextMessage.hasOwnProperty('contextInfo')
      ? message.extendedTextMessage.contextInfo.mentionedJid
      : null;

  const text = type === 'extendedTextMessage' ? message.extendedTextMessage.text : message.conversation;
  const splitedText = text.split(' ');
  const isCommand = splitedText[0].startsWith(globalConfig.prefix);
  const command = splitedText[0].replace(globalConfig.prefix, '');

  const parsedData: ParsedData = {
    messageInfo: data,
    message: data.message,
    text,
    splitedText,
    mentions,
    messageLength: text.length,
    command,
    isCommand,
    id: data.key.id,
    from: data.key.remoteJid,
    fromMe: data.key.fromMe,
    participant: data.key.participant,
    messageType: type,
    hasQuotedMessage:
      type === 'extendedTextMessage' &&
      message.extendedTextMessage.hasOwnProperty('contextInfo') &&
      message.extendedTextMessage.contextInfo.quotedMessage
        ? true
        : false,
    isGroup: isJidGroup(data.key.remoteJid),
    hasMedia: isMedia(type),
    isViewOnce: type === 'viewOnceMessage',
    getMedia: async function () {
      if (!this.hasMedia) return null;

      const _m = this.message[this.messageType];

      const stream = await downloadContentFromMessage(
        { mediaKey: _m.mediaKey.buffer, directPath: _m.directPath, url: _m.url },
        this.messageType === 'imageMessage' ? 'image' : 'video'
      );

      let buffer = Buffer.from([]);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      return buffer;
    },
    getGroupMetadata: async function () {
      if (!this.isGroup) return;

      return await client.socket.groupMetadata(this.from);
    },
    getQuotedMessage: async function (minimal?): Promise<ParsedData | MinimalMessage | null> {
      const quotedId = this.hasMedia
        ? this.message[this.messageType].contextInfo?.stanzaId
        : this.message?.extendedTextMessage?.contextInfo?.stanzaId;

      if (!quotedId) return null;

      // @ts-ignore
      const _q = await client.store.loadMessage(this.from, quotedId, client.socket).catch((err) => {
        throw new Error(err.message);
      });

      if (minimal) {
        return { key: _q.key, messageTimestamp: _q.messageTimestamp };
      }

      const quotedMessage = _q ? await parse(_q, client) : null;

      return quotedMessage;
    },
    reply: async function (content, options) {
      const response = client.socket.sendMessage(this.from, content, { quoted: this.messageInfo, ...options });
      return response;
    },
    getUserPic: async function (highres = false) {
      const picUrl = await client.socket
        .profilePictureUrl(this.isGroup ? this.participant : this.from, highres ? 'image' : 'preview')
        .catch((err) => {
          logger.debug(err, err.message);

          return undefined;
        });

      if (!picUrl) return null;

      const picResponse = await axios.get(picUrl, {
        responseType: 'arraybuffer'
      });

      if (!picResponse.data) return null;

      return picResponse.data;
    },
    getGroupPic: async function (highres = false) {
      if (!this.isGroup) {
        throw new Error('Not a group!');
      }

      const picUrl = await client.socket.profilePictureUrl(this.from, highres ? 'image' : 'preview').catch((err) => {
        logger.debug(err, err.message);

        return undefined;
      });

      if (!picUrl) return null;

      const picResponse = await axios.get(picUrl, {
        responseType: 'arraybuffer'
      });

      if (!picResponse.data) return null;

      return picResponse.data;
    }
  };

  return parsedData;
}
