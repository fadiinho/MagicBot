import { WAMessage, BaileysEventEmitter, jidNormalizedUser } from '@adiwajshing/baileys';
import { MongoClient, Collection } from 'mongodb';
import { logger } from '../utils';

export default (mongoUri: string) => {
  if (!mongoUri) throw new Error('MongoDB URI is required.');
  const _logger = logger.child({ stream: 'mongodb-store' });
  const client = new MongoClient(mongoUri);
  client.connect();

  const db = client.db('store');

  const messagesCol = db.collection('messages');
  // const chats = db.collection('chats');


  //  { [jid: string]: WAMessage[]}

  const assertMessagesList = async (jid: string) => {
    const id = jidNormalizedUser(jid);
    const user = await messagesCol.findOne({ id });

    if (!user) {
      await messagesCol.insertOne({ id, messages: [] });
      
      return await messagesCol.findOne({ id });

    }

    return user;
  }

  const insertMessage = async (message: WAMessage) => {
    const userDoc = await assertMessagesList(message.key.remoteJid);
    userDoc.messages.push(message);

    return await messagesCol.updateOne({ id: userDoc.id }, { $set: { messages: userDoc.messages } }, { upsert: true })
  }


  const bind = (ev: BaileysEventEmitter) => {
    // TODO: Implement others events
    // TODO: Auto delete messages from db after certain time
    ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        const returnStatus = await insertMessage(msg);
        _logger.debug(returnStatus, 'Upserted message to store');
      }
    });
    
    ev.on('messages.delete', async (item) => {
      if ('all' in item) {
        return await messagesCol.updateOne({ id: item.jid }, { $set: { messages: [] } });
      }

      const jid = item.keys[0].remoteJid;
      const listDoc = await messagesCol.findOne({ id: jid });

      if (listDoc) {
        const idSet = new Set(item.keys.map(k => k.id));
        listDoc.messages.filter((m: WAMessage) => idSet.has(m.key.id));
        return await messagesCol.updateOne({ id: jid }, { $set: { messages: listDoc.messages }});
      }
    });
  };

  return {
    bind,
    loadMessage: async (jid: string, id: string) => {
      const userDoc = await messagesCol.findOne({ id: jidNormalizedUser(jid) });
      if (!userDoc) throw new Error('Jid not found');

      const messages: WAMessage[] = userDoc.messages;

      const msg = messages.find((msg) => msg.key.id === id);

      return msg;
    },
    deleteAllMessagesFromUser: async (jid: string) => {
      const result = await messagesCol.deleteOne({ id: jidNormalizedUser(jid) }); 

      _logger.debug({ jid, result }, 'Deleted all messages from user');

      return result;
    }
  }
}
