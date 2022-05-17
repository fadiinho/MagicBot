import { ParsedData } from './ParsedData';
import type Client from '../Client';

export interface Command {
  name: string;
  aliases: string[];
  adminOnly?: boolean;
  groupOnly?: boolean;
  ownerOnly?: boolean;
  pvOnly?: boolean;
  description: string;
  execute(data: ParsedData, client: Client): void;
}
