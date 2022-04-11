import { ParsedData } from '../CommandHandler/Parser';
import type Client from '../Client';

export default interface Command {
  name: string;
  aliases: string[];
  adminOnly?: boolean;
  groupOnly?: boolean;
  ownerOnly?: boolean;
  pvOnly?: boolean;
  description: string;
  execute(data: ParsedData, client: Client): void;
}
