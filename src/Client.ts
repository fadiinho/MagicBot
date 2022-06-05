import { Boom } from '@hapi/boom';
import logger from './utils/Logger';
import makeWASocket, {
  useSingleFileAuthState,
  makeInMemoryStore,
  DisconnectReason,
  AuthenticationState,
  WAMessage,
  Chat,
  WAMessageKey,
  jidNormalizedUser
} from '@adiwajshing/baileys';

import { isEmoji } from './utils';

export default class Client {
  SESSION_PATH: string;
  STORE_PATH: string;
  stateObject: {
    state: AuthenticationState;
    saveState: () => void;
  };
  store: ReturnType<typeof makeInMemoryStore>;
  socket: ReturnType<typeof makeWASocket> | null;

  constructor() {
    this.SESSION_PATH = 'sessions/0_cred.json';

    this.STORE_PATH = 'sessions/0_store.json';

    this.store = makeInMemoryStore({});
    this.store.readFromFile(this.STORE_PATH);

    setInterval(() => {
      this.store.writeToFile(this.STORE_PATH);
    }, 10 * 1000);

    this.stateObject = useSingleFileAuthState(this.SESSION_PATH);

    this.socket = null;
  }

  init() {
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

      console.log('Connected!');
    });

    this.socket.ev.on('creds.update', this.stateObject.saveState);
  }

  onMessage(callback: (message: WAMessage) => void) {
    this.socket?.ev.on('messages.upsert', (data) => {
      const { messages, type } = data;
      if (type !== 'notify') return;

      for (const _msg of messages) {
        callback(_msg);
      }
    });
  }

  onChatUpdate(callback: (message: Chat) => void) {
    this.socket?.ev.on('chats.upsert', (data) => {
      for (const _chat of data) {
        callback(_chat);
      }
    });
  }

  async reactToMsg(key: WAMessageKey, emoji: string) {
    if (!isEmoji(emoji)) {
      throw new Error(`${emoji} is not a valid emoji`);
    }

    const reaction = {
      react: {
        text: emoji,
        key: {
          ...key,
          participant: key.participant ? jidNormalizedUser(key.participant) : null
        }
      }
    };

    return await this.socket?.sendMessage(key.remoteJid, reaction);
  }
}
