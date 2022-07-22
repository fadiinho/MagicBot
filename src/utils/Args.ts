import { ParsedData } from '../structures';

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
  matchedCommand?: Arg;
  matchedArg?: string[] | string;
  matchedSubCommand?: ParsedArgs;
  error?: boolean;
  errorMessage?: string;
}

export const parse = (text: string, args: Arg[], subCommand = false) => {
  // text => !tw (command) arg [...subCommands] [...args]
  const splitedText = text.split(' ');

  let newSplited = subCommand ? splitedText : splitedText.slice(1); // (command) arg [...subCommands] [...args]

  const matchedCommand = args.find((_command) => _command.name === newSplited[0]) || args.find((_command) => _command.default);

  if (!matchedCommand) {
    return { error: true, errorMessage: 'command-not-found' };
  };

  newSplited = matchedCommand.default && newSplited[0] !== matchedCommand.name ? newSplited : newSplited.slice(1); // arg [...subCommands] [...args]

  const matchedArg = newSplited[0]; // -> arg <- [...subCommands] [...args]

  if (!matchedArg && matchedCommand.argsRequired) {
    return { error: true, errorMessage: 'args-required' };
  }

  if (matchedCommand.pattern) {
    const isMatched = matchedCommand.pattern.test(matchedArg);

    if (!isMatched) return { error: true, errorMessage: 'wrong-pattern'}
  }

  newSplited = newSplited.slice(1); // [...subCommands] [...args]

  const matchedSubCommand =  matchedCommand.subCommands && newSplited.length ? parse(newSplited.join(' '), matchedCommand.subCommands, true) : undefined;

  return { matchedCommand, matchedArg, matchedSubCommand }
}
