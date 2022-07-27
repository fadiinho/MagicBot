import { MongoClient } from 'mongodb';

import { logger } from '../../utils';

export const connect = async (mongoUri: string) => {
  if (!mongoUri) throw new Error('MongoDB URI is required.');

  const client = new MongoClient(mongoUri, {
    maxIdleTimeMS: 5000
  });

  await client.connect();

  logger.info('Connected to MongoDB!');

  process.on('SIGTERM', () => {
    logger.debug('Received SIGTERM, closing connection to MongoDB.');
    client.close(() => {
      logger.debug('Connection to MongoDB closed.');
      process.exit(0);
    });
  });

  return client;
}
