export interface Arg {
  name: string;
  description?: string;
  pattern?: RegExp;
  argsRequired: boolean;
  subCommands?: Arg[];
  default: boolean;
}

export interface ParsedArgs {
  name?: string;
  matchedCommand?: Arg;
  matchedArg?: string[] | string;
  matchedSubCommand?: ParsedArgs;
  error?: boolean;
  errorMessage?: string;
}

export const parse = (text: string, args: Arg[], subCommand = false): ParsedArgs => {
  const splitedText = text.split(' ');

  let newSplited = subCommand ? splitedText : splitedText.slice(1); 

  const matchedCommand = args.find((_command) => _command.name === newSplited[0]) || args.find((_command) => _command.default);

  if (!matchedCommand) {
    return { error: true, errorMessage: 'command-not-found' };
  };

  newSplited = matchedCommand.default && newSplited[0] !== matchedCommand.name ? newSplited : newSplited.slice(1);

  const matchedArg = newSplited[0];

  if (!matchedArg && matchedCommand.argsRequired) {
    return { error: true, errorMessage: 'args-required' };
  }

  if (matchedCommand.pattern) {
    const isMatched = matchedCommand.pattern.test(matchedArg);

    if (!isMatched) return { error: true, errorMessage: 'wrong-pattern'}
  }

  newSplited = newSplited.slice(1);

  const matchedSubCommand =  matchedCommand.subCommands && newSplited.length ? parse(newSplited.join(' '), matchedCommand.subCommands, true) : undefined;

  return { name: matchedCommand.name, matchedCommand, matchedArg, matchedSubCommand }
}
