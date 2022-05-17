import { WAMessage } from '@adiwajshing/baileys';
import type Client from '../Client';
import parse from './Parser';
import commands from '../commands';
import { Command } from '../Types';

declare type Options = {
  commandsDir: string;
};

class Handler {
  options: Options;
  commands: Command[];

  constructor(options: Options) {
    if (!options.commandsDir) {
      throw new Error('commandsDir not suplied.');
    }

    this.options = options;
    this.commands = [];
    this.set();
  }

  set() {
    const commandsKeys = Object.keys(commands);
    for (const k of commandsKeys) {
      this.commands.push(new commands[k]());
    }
  }

  get(name: string) {
    return this.commands.find((command) => command.aliases.includes(name));
  }

  async handleMessage(data: WAMessage, client: Client) {
    const parsedData = await parse(data, client);

    if (!parsedData.isCommand) return;

    const command = this.get(parsedData.command);

    if (!command) return;

    command.execute(parsedData, client);
  }
}

export default Handler;
