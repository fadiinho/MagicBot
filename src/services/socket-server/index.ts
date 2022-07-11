import type Client from '../../Client';
import parser from '../../CommandHandler/Parser';

import { emitMessage } from './events';

const bind = (client: Client) => {
  client.onMessage(async (_data) => {
    const data = await parser(_data, client);

    emitMessage(data);
  })
}

export default bind;

