import { WAMessage } from '@adiwajshing/baileys';
import type Client from '../Client';
import parse from './Parser';
import * as commands from '../commands';
import { Command } from '../structures';
import { inhibit } from './Inhibitor';

import globalConfig from '../config/global.json';

class Handler {
  commands: Command[];
  config: { prefix?: string; botName?: string }

  constructor() {
    this.commands = [];
    this.set();
    this.config = globalConfig;
  }

  set() {
    const commandsKeys = Object.keys(commands);
    for (const k of commandsKeys) {
      this.commands.push(new commands[k].default());
    }
  }

  get(name: string) {
    return this.commands.find((command) => command.info.aliases.includes(name));
  }

  async handleMessage(data: WAMessage, client: Client) {
    const parsedData = await parse(data, client);

    if (!parsedData.isCommand) return;

    const command = this.get(parsedData.command);

    if (!command) return;

    const result = await inhibit(parsedData, client, command);

    if (!result) return;

    command.execute(parsedData, client);
  }
}

export default Handler;
