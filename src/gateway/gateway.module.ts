import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { GatewayDataInitializerService } from './gateway-data-initializer.service';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
  imports: [DatabaseModule],
  controllers: [GatewayController],
  providers: [GatewayService, GatewayDataInitializerService],
})
export class GatewayModule{}
