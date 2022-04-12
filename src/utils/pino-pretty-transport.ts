import pinoPretty, { PrettyOptions } from 'pino-pretty';

export default (opts: PrettyOptions) =>
  pinoPretty({
    ...opts,
    messageFormat: '{msg}',
    customPrettifiers: {
      time: (timestamp: any) => {
        const d = new Date(timestamp);
        const hours = d.getHours();
        const min = d.getMinutes();
        const sec = d.getSeconds();

        return `${hours}:${min}:${sec}`;
      }
    }
  });
