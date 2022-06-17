import emojiRegex from 'emoji-regex';

export function isEmoji(str: string) {
  const regexExp = emojiRegex();

  return regexExp.test(str);
}
