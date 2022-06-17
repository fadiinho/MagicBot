interface Arg {
  name: string;
  description?: string;
  content?: string;
  pattern?: RegExp;
  argsRequired: boolean;
  subCommands?: Arg[];
}

class ArgsParser {
  static parse(text: string, args: Arg[]) {
    if (args.length === 0) return;
    const splitedText = text.split(' ');
    let commands = splitedText.slice(1);
    const command = commands[0];
    commands = commands.slice(1);
    const expectedCommand = args.find(arg => arg.name === command);

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
      name: command,
      matchedArgs: arg,
      subCommands: this.parse(commands.join(' '), expectedCommand.subCommands || [])
    };
  }
}

