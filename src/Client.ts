import { Boom } from '@hapi/boom';
import logger from './utils/Logger';
import makeWASocket, {
  useMultiFileAuthState,
  makeInMemoryStore,
  DisconnectReason,
  WAMessage,
  Chat,
  WAMessageKey,
  jidNormalizedUser,
  proto
} from '@adiwajshing/baileys';

import { isEmoji } from './utils';

export default class Client {
  SESSION_PATH: string;
  STORE_PATH: string;
  stateObject: Awaited<ReturnType<typeof useMultiFileAuthState>>;
  store: ReturnType<typeof makeInMemoryStore>;
  socket: ReturnType<typeof makeWASocket> | null;
  events: { event: string; on: () => void }[];

  constructor() {
    this.SESSION_PATH = 'sessions/0_state';

    this.STORE_PATH = 'sessions/0_store.json';

    this.store = makeInMemoryStore({});
    this.store.readFromFile(this.STORE_PATH);

    setInterval(() => {
      this.store.writeToFile(this.STORE_PATH);
    }, 10 * 1000);

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
      const { connection, lastDisconnect } = update;

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
