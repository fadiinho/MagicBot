import { ParsedData, Command } from '../Types';
import type Client from '../Client';
import { jidNormalizedUser } from '@adiwajshing/baileys';
import { isAdmin } from '../utils';

const BOT_OWNER = process.env.OWNER;

export async function inhibit(data: ParsedData, client: Client, command: Command) {
  const from = data.isGroup ? jidNormalizedUser(data.participant) : jidNormalizedUser(data.from);

  if (command?.groupOnly && !data.isGroup) {
    data.reply({ text: 'Comando só pode ser usado em um grupo!' });
    return false;
  }

  if (command?.pvOnly && data.isGroup) {
    data.reply({ text: 'Comando só pode ser usado no privado!' });
    return false;
  }

  if (command?.ownerOnly && from !== BOT_OWNER) {
    data.reply({ text: 'Comando somente para o dono do bot!' });
    return false;
  }

  if (command?.adminOnly && !(await isAdmin(from, data.from, client))) {
    data.reply({ text: 'Comando somente para o adm do grupo!' });
    return false;
  }

  return true;
}
