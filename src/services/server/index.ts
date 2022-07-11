import express from 'express';
import http from 'http';
import { join } from 'path';
import { logger } from '../../utils';

const port = process.env.PORT || 3000;

export const app = express();

app.use(express.static('public'));

const server = http.createServer(app);

app.get('/', (_req, res) => {
  res.sendFile('public/index.html')
})

server.listen(port, () => {
  logger.debug(`listen on port: ${port}`)
})

export default server;
