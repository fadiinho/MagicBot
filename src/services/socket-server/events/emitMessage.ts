import socket from '../socket';
import { ParsedData } from '../../../structures';

export const emitMessage = async (_data: ParsedData) => {
  const data = {
    isGroup: _data.isGroup,
    messageInfo: _data.messageInfo,
    text: _data.text,
    from: _data.from,
    media: _data.hasMedia ? await _data.getMedia() : undefined,
    command: _data.command,
    participant: _data.isGroup ? _data.participant : undefined,
    isCommand: _data.isCommand,
    type: _data.messageType,
    userPicture: await _data.getUserPic(false)
  }

  // logger.debug(data, 'emiting message');

  socket.emit('message', data)
}

