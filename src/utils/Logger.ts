import dotenv from 'dotenv';
dotenv.config();

import pino from 'pino';

const logger = pino({
  transport: {
    target: './pino-pretty-transport.ts'
  }
}).child({ level: process.env.ENVIROMENT === 'production' ? 'info' : 'debug' });

export default logger;
