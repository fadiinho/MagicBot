export default function isMedia(type: string) {
  return ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(type);
}
