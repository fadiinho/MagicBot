import dotenv from 'dotenv';
dotenv.config();
import Service from 'twitch-service';
import { IRouter } from 'express';

const service = new Service({
  clientId: process.env.TWITCH_CLIENT_ID,
  clientSecret: process.env.TWITCH_SECRET
}, process.env.HOSTNAME);

export default async (app?: IRouter) => {
  if (!app) return;
  await service.applyMiddleware(app);
  await service.markAsReady();

  return service;
}

export const getUser = async (userName: string) => {
  const user = await service.client.apiClient.users.getUserByName(userName);

  return {
    userName: user.name,
    userId: user.id,
    userDisplayName: user.displayName,
    userPicture: user.profilePictureUrl,
    _user: user
  }

}

export const getStram = async (userName: string) => {
  const stream = await service.client.getStreamByUsername(userName);

  return stream;
}
