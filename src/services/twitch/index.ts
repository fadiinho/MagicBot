import dotenv from 'dotenv';
dotenv.config();

import Service from 'twitch-service';
import { IRouter } from 'express';
import type Client from '../../Client';
import axios from 'axios';

const service = new Service(
  {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_SECRET
  },
  process.env.HOSTNAME
);

type GroupEvent = {
  userName: string;
  message?: string;
  eventType: string;
  groupMod: { jid: string; mod: { subject: string } };
};

const bindedEvents: {
  [eventType: string]: Omit<GroupEvent, 'eventType'>[];
} = { streamup: [], streamdown: [] };

export const bindNotifications = async (client: Client, events: GroupEvent[]) => {
  // TODO: This is duplicated code. Refactor to make more dinamic
  for (const event of events) {
    if (event.eventType === 'streamdown') {
      await service.streamOffline(event.userName);
      bindedEvents[event.eventType].push({
        userName: event.userName,
        message: event.message,
        groupMod: event.groupMod
      });
    }

    if (event.eventType === 'streamup') {
      await service.streamOnline(event.userName);
      bindedEvents[event.eventType].push({
        userName: event.userName,
        message: event.message,
        groupMod: event.groupMod
      });
    }
  }

  service.on('streamOnline', async (_data) => {
    const broadcasterName = _data.broadcasterName;
    const eventToEmit = bindedEvents.streamup.find((item) => item.userName === broadcasterName);

    if (!eventToEmit) return;

    const metaData = await client.socket.groupMetadata(eventToEmit.groupMod.jid);

    const user = await getUser(broadcasterName);

    const message = eventToEmit.message.replaceAll('%userName%', eventToEmit.userName);

    const response = await axios.get(user.profilePictureUrl, {
      responseType: 'arraybuffer'
    });

    const img = response.data;

    client.socket.sendMessage(eventToEmit.groupMod.jid, {
      image: img,
      caption: message,
      mentions: metaData.participants.map((meta) => meta.id)
    });

    client.socket.groupUpdateSubject(eventToEmit.groupMod.jid, eventToEmit.groupMod.mod.subject);
  });

  service.on('streamOffline', (_data) => {
    const { broadcasterName } = _data;
    const eventToEmit = bindedEvents.streamdown.find((item) => item.userName === broadcasterName);

    if (!eventToEmit) return;

    client.socket.groupUpdateSubject(eventToEmit.groupMod.jid, eventToEmit.groupMod.mod.subject);
  });
};

export const getUser = async (userName: string) => {
  if (!userName) throw Error('User name is required.');

  const user = await service.client.apiClient.users.getUserByName(userName).catch((err) => {
    throw new Error(err.message);
  });

  return user;
};

export const getStream = async (userName: string) => {
  if (!userName) throw Error('User name is required.');

  const stream = await service.client.apiClient.streams.getStreamByUserName(userName).catch((err) => {
    throw new Error(err.message);
  });

  return stream;
};

export const getTotalFollowersCount = async (userName: string) => {
  if (!userName) throw Error('User name is required.');

  const user = await getUser(userName).catch((err) => {
    throw new Error(err.message);
  });

  const followers = service.client.apiClient.users.getFollowsPaginated({ followedUser: user.id });

  return await followers.getTotalCount();
};

export default async (_client: Client, app?: IRouter) => {
  if (!app) return;
  await service.applyMiddleware(app);
  await service.markAsReady();

  return service;
};
