import { WAMessage, WAMessageContent, MessageType, GroupMetadata } from '@adiwajshing/baileys';

export declare type ParsedData = {
  messageInfo: WAMessage;
  message: WAMessageContent;
  text: string;
  splitedText: string[];
  mentions: string[];
  messageLength: number;
  command: string;
  id: string;
  from: string;
  fromMe: boolean;
  participant: string;
  messageType: string;
  hasQuotedMessage: boolean;
  isGroup: boolean;
  hasMedia: boolean;
  isCommand: boolean;
  isViewOnce: boolean;
  getMedia(): MessageType | null;
  getGroupMetadata(): Promise<GroupMetadata | null>;
  getQuotedMessage(): Promise<ParsedData | null>;
};