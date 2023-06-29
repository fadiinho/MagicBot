import express from 'express';
import http from 'http';
import { join } from 'path';
import { logger } from '../../utils';
import { BaileysEventEmitter } from '@adiwajshing/baileys';
import qrcode from 'qrcode';

const staticPath = join(__dirname, '../../../public');

const port = process.env.PORT || 3000;

export const app = express();

app.use(express.static(staticPath));

const server = http.createServer(app);

app.get('/', (_req, res) => {
  res.sendFile(staticPath + '/index.html')
})

server.listen(port, () => {
  logger.debug(`listen on port: ${port}`)
})

export function bindQr(ev: BaileysEventEmitter) {
  let qr: any;
  ev.on('connection.update', async (update) => {
    if (update?.qr) {
      qr = await qrcode.toDataURL(update.qr);
    }
  });

  app.get('/qr', async (_req, res) => {
    res.json({ qr })
  });
}

export default server;
