import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { databaseModelsProviders } from './database-models.providers';
import {
  DATABASE_CONNECTION, DEVICE_MODEL, GATEWAY_MODEL,
  USER_MODEL
} from './database.constants';
import { Device, DeviceModel } from './device.model';
import { Gateway, GatewayModel } from './gateway.model';
import { User, UserModel } from './user.model';

describe('DatabaseModelsProviders', () => {
  let conn: any;
  let userModel: any;
  let gatewayModel: any;
  let deviceModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...databaseModelsProviders,

        {
          provide: DATABASE_CONNECTION,
          useValue: {
            model: jest
              .fn()
              .mockReturnValue({} as Model<User | Gateway | Device>),
          },
        },
      ],
    }).compile();

    conn = module.get<Connection>(DATABASE_CONNECTION);
    userModel = module.get<UserModel>(USER_MODEL);
    gatewayModel = module.get<GatewayModel>(GATEWAY_MODEL);
    deviceModel = module.get<DeviceModel>(DEVICE_MODEL);
  });

  it('DATABASE_CONNECTION should be defined', () => {
    expect(conn).toBeDefined();
  });

  it('USER_MODEL should be defined', () => {
    expect(userModel).toBeDefined();
  });

  it('POST_MODEL should be defined', () => {
    expect(gatewayModel).toBeDefined();
  });

  it('COMMENT_MODEL should be defined', () => {
    expect(deviceModel).toBeDefined();
  });
});
