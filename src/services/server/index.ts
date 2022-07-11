import express from 'express';
import http from 'http';
import { join } from 'path';
import { logger } from '../../utils';

const staitcPath = join(__dirname, '../../../public');

const port = process.env.PORT || 3000;

export const app = express();

app.use(express.static(staitcPath));

const server = http.createServer(app);

app.get('/', (_req, res) => {
  res.sendFile(staitcPath + '/index.html')
})

server.listen(port, () => {
  logger.debug(`listen on port: ${port}`)
})

export default server;
