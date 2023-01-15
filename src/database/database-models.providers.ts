import { Connection } from 'mongoose';
import {
  DATABASE_CONNECTION, DEVICE_MODEL, GATEWAY_MODEL,
  USER_MODEL
} from './database.constants';
import { createDeviceModel } from './device.model';
import { createGatewayModel } from './gateway.model';
import { createUserModel } from './user.model';

export const databaseModelsProviders = [
  {
    provide: GATEWAY_MODEL,
    useFactory: (connection: Connection) => createGatewayModel(connection),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: DEVICE_MODEL,
    useFactory: (connection: Connection) => createDeviceModel(connection),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: USER_MODEL,
    useFactory: (connection: Connection) => createUserModel(connection),
    inject: [DATABASE_CONNECTION],
  },
];
