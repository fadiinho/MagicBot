import type Client from '../Client';
import { Command, ParsedData } from '../structures';
const BOT_OWNER = process.env.OWNER;

export const info = {
  name: 'Create Group',
  aliases: ['!creategroup', '!cg', '!criargrupo'],
  description: 'Comando para o bot criar um grupo!',
  help: '*!creategroup*',
  ownerOnly: true
};

export default class CreateGroup implements Command {
  info = info;
  // TODO: Add a way to choose group name and participants
  async execute(_data: ParsedData, client: Client): Promise<void> {
    await client.socket.groupCreate('My Fab Group', [BOT_OWNER]);
  }
}
