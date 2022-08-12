import Client from '../Client';
import { Command, ParsedData } from '../structures';
import AnimeApi from 'anime-image-search';

export default class AnimeSearch implements Command {
  info = {
    name: 'Anime Search',
    aliases: ['sauce', 'animesearch'],
    description: 'Comando para encontrar a fonte de uma imagem (anime).',
    help: '*!sauce*'
  };

  async execute(data: ParsedData, client: Client): Promise<void> {
    const { hasQuotedMessage, messageInfo } = data;

    const api = new AnimeApi({
      saucenaoKey: process.env.SAUCENAO_API_KEY
    });

    if (!hasQuotedMessage) {
      await client.reactToMsg(messageInfo.key, { emoji: '❌' });
      data.reply({ text: 'Você precisa marcar uma imagem.' });
      return;
    }
    const quoted = await data.getQuotedMessage() as ParsedData;
    if (!quoted) {
      await client.reactToMsg(messageInfo.key, { emoji: '❌' });
      data.reply({ text: 'Algo deu errado, tente re-enviar a imagem.' });
      return;
    }
    const type = quoted.messageType;

    if (!quoted.hasMedia || type !== 'imageMessage') {
      await client.reactToMsg(messageInfo.key, { emoji: '❌' });
      data.reply({ text: 'A mensagem marcada precisa conter uma imagem.' });
      return;
    }

    await client.reactToMsg(messageInfo.key, { emoji: '⌛' });
    data.reply({ text: 'Um momento, estou procurando a imagem.' });

    const buffer = await quoted.getMedia();

    const result = await api.saucenao(buffer, {
      hide: 1,
      min_similarity: 72
    });
    if (!result.length) {
      await client.reactToMsg(messageInfo.key, { remove: true });
      data.reply({ text: 'Infelizmente não encontrei a fonte 😔' });
      return;
    }

    await client.reactToMsg(messageInfo.key, { remove: true });
    await client.reactToMsg(messageInfo.key, { emoji: '✅' });
    const { data: imgData } = result[0];

    data.reply({ text: `Encontrei a imagem.\nFonte: ${imgData.ext_urls[0]}` });
  }
}
