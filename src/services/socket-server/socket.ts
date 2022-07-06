import { Server } from 'socket.io';
import { logger } from '../../utils';
import httpServer from './server';
import { onBlockUser } from './events';

const socket = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

socket.on('connection', (sock) => {
  logger.debug({ id: sock.id }, 'new user connected')
  sock.on('block_user', onBlockUser)
})

export default socket;
