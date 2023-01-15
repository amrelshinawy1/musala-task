import { Test, TestingModule } from '@nestjs/testing';
import { lastValueFrom, of } from 'rxjs';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
      controllers: [UserController],
    }).compile();

    controller = app.get<UserController>(UserController);
    service = app.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getUser', async () => {
    jest
      .spyOn(service, 'findById')
      .mockImplementationOnce((id: string, withPosts: boolean) =>
        of({
          username: 'amr',
          password: 'mysecret',
          email: 'amr@example.com',
          firstName: 'amr',
          lastName: 'ahmed',
        } as any),
      );
    const user = await lastValueFrom(controller.getUser('id', false));
    expect(user.firstName).toBe('amr');
    expect(user.lastName).toBe('ahmed');
    expect(service.findById).toBeCalledWith('id', false);
  });
});
