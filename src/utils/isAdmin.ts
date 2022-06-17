import type Client from '../Client';
import { jidNormalizedUser } from '@adiwajshing/baileys';

export async function isAdmin(participant: string, groupId: string, client: Client) {
  const { participants } = await client.socket.groupMetadata(groupId);

  for (const p of participants) {
    if (p.id === jidNormalizedUser(participant) && (p.admin === 'admin' || p.admin === 'superadmin')) return true;
  }

  return false;
}
