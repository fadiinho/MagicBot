import dotenv from 'dotenv';
dotenv.config();

import pino from 'pino';

const logger = pino({
  transport: {
    target: process.env.NODE_ENV === 'production' ? './pino-pretty-transport.js' : './pino-pretty-transport.ts'
  },
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

export default logger;
