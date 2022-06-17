export function replaceMentionedJids(text: string, mentions: string[]) {
  const newMentions = mentions.map((item) => '@' + item.replace('@s.whatsapp.net', ''));

  let newText = text;
  newMentions.map((mention) => {
    newText = newText.replace(mention + ' ', '');
  });

  return newText;
}
