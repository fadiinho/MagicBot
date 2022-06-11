import Client from '../Client';
import { Command, ParsedData } from '../structures';
import { isAdmin } from '../utils';

export const info = {
  name: 'TagAll',
  aliases: ['!tagall', '!marcartodos'],
  description: '*!tagall*\nMarque todos no grupo.',
  adminOnly: true,
  groupOnly: true
};

export default class TagAll implements Command {
  info = info;

  async execute(data: ParsedData, client: Client) {
    const { from, isGroup, participant } = data;

    if (!isGroup) return;

    const admin = await isAdmin(participant, from, client);

    if (!admin) return;
    const { participants } = await client.socket.groupMetadata(from);

    data.reply({ text: '@everyone', mentions: participants.map((p) => p.id) });
  }
}
