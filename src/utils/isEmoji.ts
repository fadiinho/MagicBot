import emojiRegex from 'emoji-regex';

export default function isEmoji(str: string) {
  const regexExp = emojiRegex();

  return regexExp.test(str);
}
