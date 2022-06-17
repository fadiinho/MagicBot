import dotenv from 'dotenv';
dotenv.config();

import pino from 'pino';

import pinoPretty from 'pino-pretty';

const pinoStream = pinoPretty({
  messageFormat: '{msg}',
  customPrettifiers: {
    time: (timestamp: any) => {
      const d = new Date(timestamp);
      const hours = d.getHours();
      const min = d.getMinutes();
      const sec = d.getSeconds();
      return `${hours}:${min}:${sec}`;
    }
  }
})

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}, pinoStream);

