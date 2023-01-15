import {
  Inject,
  Injectable,
  OnModuleInit
} from '@nestjs/common';
import { Model } from 'mongoose';
import { GATEWAY_MODEL } from '../database/database.constants';
import { Gateway } from '../database/gateway.model';
import { CreateGatewayDto } from './create-gateway.dto';

@Injectable()
export class GatewayDataInitializerService
  implements OnModuleInit {
  private data: CreateGatewayDto[] = [
    {
      serial: '123_456_789',
      name: 'gateway 1',
      ip4address: '192.168.0.1'
  },
    {
      serial: '123_456_789',
      name: 'gateway 2',
      ip4address: '192.168.0.1'
  },
    {
      serial: '123_456_789',
      name: 'gateway 3',
      ip4address: '192.168.0.1'
  },
  ];

  constructor(
    @Inject(GATEWAY_MODEL) private gatewayModel: Model<Gateway>,
  ) { }

  async onModuleInit(): Promise<void> {
    console.log('(GatewayModule) is initialized...');
    await this.gatewayModel.deleteMany({});
    await this.gatewayModel.insertMany(this.data).then((r) => console.log(r));
  }
}
