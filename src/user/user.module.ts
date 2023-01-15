import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ProfileController } from './profile.controller';
import { RegisterController } from './register.controller';
import { UserDataInitializerService } from './user-data-initializer.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
@Module({
  imports: [DatabaseModule],
  providers: [UserService, UserDataInitializerService],
  exports: [UserService],
  controllers: [ProfileController, UserController, RegisterController],
})
export class UserModule {}
