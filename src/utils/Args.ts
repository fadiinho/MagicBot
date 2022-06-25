import { ParsedData } from "../structures";

export interface Arg {
  name: string;
  description?: string;
  pattern?: RegExp;
  argsRequired: boolean;
  subCommands?: Arg[];
  default: boolean;
  run?: (data: ParsedData, ...args: any) => any;
}

export interface ParsedArgs {
  name?: string;
  matchedCommand?: Arg;
  matchedArgs?: string[];
  subCommands?: ParsedArgs;
  error?: string;
  message?: string
}


export class ArgsParser {
  static parse(text: string, args: Arg[]): ParsedArgs {
    if (args.length === 0) return;
    const splitedText = text.split(' ');
    let commands = splitedText.slice(1);
    const command = commands[0];
    commands = commands.length === 1 ? commands : commands.slice(1);
    const expectedCommand = args.find(arg => arg.name === command) || args.find(arg => arg.default);

    let arg: string[] = [];

    if (!expectedCommand) return { error: 'not found', message: `Command "${command}" not found.` };
    if (expectedCommand.pattern) {
      arg = commands.filter((cmd) => {
        return expectedCommand.pattern.test(cmd);
      });
    } else {
      arg = commands;
    }

    if (expectedCommand.argsRequired && arg.length === 0) return { error: 'args required', message: 'This command requires args.' };

    return {
      name: expectedCommand.name,
      matchedArgs: arg,
      subCommands: expectedCommand.subCommands ? this.parse(commands.join(' '), expectedCommand.subCommands) : undefined,
      matchedCommand: expectedCommand
    };
  }
}

