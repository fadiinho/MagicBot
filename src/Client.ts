import { Boom } from '@hapi/boom';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  WAMessage,
  Chat,
  WAMessageKey,
  jidNormalizedUser,
  proto
} from '@adiwajshing/baileys';

import type Handler from './CommandHandler';

import { isEmoji, logger } from './utils';

import { makeMongoStore } from './store';

export default class Client {
  SESSION_PATH: string;
  STORE_PATH: string;
  stateObject: Awaited<ReturnType<typeof useMultiFileAuthState>>;
  store: ReturnType<typeof makeMongoStore>;
  socket: ReturnType<typeof makeWASocket> | null;
  events: { event: string; on: () => void }[];
  handler: Handler | undefined;

  constructor(handler?: Handler) {
    this.SESSION_PATH = 'sessions/0_state';

    this.STORE_PATH = 'sessions/0_store.json';

    this.handler = handler;
    this.store = makeMongoStore(process.env.MONGODB_URI);

    this.socket = null;
    this.events = [];
  }

  async init() {
    this.stateObject = await useMultiFileAuthState(this.SESSION_PATH);

    this.socket = makeWASocket({
      auth: this.stateObject.state,
      logger: logger,
      printQRInTerminal: true
    });

    this.store.bind(this.socket.ev);

    this.socket.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, receivedPendingNotifications } = update;

      if (receivedPendingNotifications && process.env.OWNER) {
        this.socket.sendMessage(process.env.OWNER, {
          text: `*Bot is ready!*\n` +
            `Received all notifications!\n` +
            `Commands loaded: ${this.handler.commands.length}`
        });
      }

      if (connection === 'close') {
        if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
          this.init();
          return;
        } else {
          throw new Error(`Connection closed due to: Logged Out`);
        }
      }
    });

    this.socket.ev.on('creds.update', this.stateObject.saveCreds);
    this.events.map((event) => {
      event.on();
      logger.debug({ event: event.event }, 'listening for Event');
    });
  }

  onMessage(callback: (message: WAMessage) => void) {
    this.events.push({
      event: 'messages.upsert',
      on: () => {
        this.socket?.ev.on('messages.upsert', (data) => {
          const { messages, type } = data;
          if (type !== 'notify') return;

          for (const _msg of messages) {
            callback(_msg);
          }
        });
      }
    });
  }

  onChatUpdate(callback: (message: Chat) => void) {
    this.events.push({
      event: 'chats.upsert',
      on: () => {
        this.socket?.ev.on('chats.upsert', (data) => {
          for (const _chat of data) {
            callback(_chat);
          }
        });
      }
    });
  }

  async reactToMsg(key: WAMessageKey, options: { emoji?: string; remove?: boolean }) {
    if (!isEmoji(options.emoji) && !options.remove) {
      throw new Error(`${options.emoji} is not a valid emoji`);
    }

    let reaction: proto.IReactionMessage;

    if (options.remove) {
      reaction = {
        text: '',
        key: {
          ...key,
          participant: key.participant ? jidNormalizedUser(key.participant) : null
        }
      };
    } else {
      reaction = {
        text: options.emoji,
        key: {
          ...key,
          participant: key.participant ? jidNormalizedUser(key.participant) : null
        }
      };
    }

    return await this.socket?.sendMessage(key.remoteJid, { react: reaction });
  }
}
