import { ParsedData } from './ParsedData';
import { Arg } from '../utils';
import type Client from '../Client';

// TODO: Add docs

export interface Command {
  info: {
    name: string;
    aliases: string[];
    adminOnly?: boolean;
    groupOnly?: boolean;
    ownerOnly?: boolean;
    pvOnly?: boolean;
    description: string;
    args?: Arg[];
    help?: string;
  };
  execute(data: ParsedData, client: Client): void;
}
