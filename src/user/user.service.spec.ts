import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';

import { USER_MODEL } from '../database/database.constants';
import { User } from '../database/user.model';
import { RoleType } from '../shared/enum/role-type.enum';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let model: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_MODEL,
          useValue: {
            findOne: jest.fn(),
            exists: jest.fn(),
            create: jest.fn(),
          },
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<User>>(USER_MODEL);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('save ', async () => {
    const sampleData = {
      username: 'amr',
      email: 'amr@example.com',
      firstName: 'amr',
      lastName: 'ahmed',
      password: 'mysecret',
    };

    const msg = {
      from: 'service@example.com', // Use the email address or domain you verified above
      subject: 'Welcome to Nestjs Sample',
      templateId: 'welcome',
      personalizations: [
        {
          to: 'amr@example.com',
          dynamicTemplateData: { name: 'amr ahmed' },
        },
      ],
    };

    const saveSpy = jest.spyOn(model, 'create').mockImplementation(() =>
      Promise.resolve({
        _id: '123',
        ...sampleData,
      } as any),
    );

    const pipeMock = {
      pipe: jest.fn(),
    };

    const pipeSpy = jest.spyOn(pipeMock, 'pipe');

    const result = await lastValueFrom(service.register(sampleData));
    expect(saveSpy).toBeCalledWith({ ...sampleData, roles: [RoleType.USER] });
    expect(result._id).toBeDefined();
    //expect(sendSpy).toBeCalledWith(msg);
    //expect(pipeSpy).toBeCalled();
  });

  it('findByUsername should return user', async () => {
    jest
      .spyOn(model, 'findOne')
      .mockImplementation((filter: any, callback: any) => {
        return {
          exec: jest.fn().mockResolvedValue({
            username: 'amr',
            email: 'amr@example.com',
          } as User),
        } as any;
      });

    const foundUser = await lastValueFrom(service.findByUsername('amr'));
    expect(foundUser).toEqual({
      username: 'amr',
      email: 'amr@example.com',
    });
    expect(model.findOne).lastCalledWith({ username: 'amr' });
    expect(model.findOne).toBeCalledTimes(1);
  });

  describe('findById', () => {
    it('return one result', async () => {
      jest
        .spyOn(model, 'findOne')
        .mockImplementation(
          (filter: any, callback: any) => {
            return {
              exec: jest.fn().mockResolvedValue({
                username: 'amr',
                email: 'amr@example.com',
              } as User),
            } as any;
          },
        );

      const foundUser = await lastValueFrom(service.findById('amr'));
      expect(foundUser).toEqual({
        username: 'amr',
        email: 'amr@example.com',
      });
      expect(model.findOne).lastCalledWith({ _id: 'amr' });
      expect(model.findOne).toBeCalledTimes(1);
    });

    it('return a null result', async () => {
      jest
        .spyOn(model, 'findOne')
        .mockImplementation(
          (filter: any, callback: any) => {
            return {
              exec: jest.fn().mockResolvedValue(null) as any,
            } as any;
          },
        );

      try {
        const foundUser = await lastValueFrom(service.findById('amr'));
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('parameter withPosts=true', async () => {
      jest
        .spyOn(model, 'findOne')
        .mockImplementation(
          (filter: any, callback: any) => {
            return {
              populate: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue({
                username: 'amr',
                email: 'amr@example.com',
              } as User),
            } as any;
          },
        );

      const foundUser = await lastValueFrom(service.findById('amr', true));
      expect(foundUser).toEqual({
        username: 'amr',
        email: 'amr@example.com',
      });
      expect(model.findOne).lastCalledWith({ _id: 'amr' });
      expect(model.findOne).toBeCalledTimes(1);
    });
  });

  describe('existsByUsername', () => {
    it('should return true if exists ', async () => {
      const existsSpy = jest
        .spyOn(model, 'exists')
        .mockImplementation((filter: any) => {
          return {
            exec: jest.fn().mockResolvedValue({
              _id: 'test',
            } as any),
          } as any;
        });
      const result = await lastValueFrom(service.existsByUsername('amr'));

      expect(existsSpy).toBeCalledWith({ username: 'amr' });
      expect(existsSpy).toBeCalledTimes(1);
      expect(result).toBeTruthy();
    });

    it('should return false if not exists ', async () => {
      const existsSpy = jest
        .spyOn(model, 'exists')
        .mockImplementation((filter: any) => {
          return {
            exec: jest.fn().mockResolvedValue(null),
          } as any;
        });
      const result = await lastValueFrom(service.existsByUsername('amr'));

      expect(existsSpy).toBeCalledWith({ username: 'amr' });
      expect(existsSpy).toBeCalledTimes(1);
      expect(result).toBeFalsy();
    });
  });

  describe('existsByEmail', () => {
    it('should return true if exists ', async () => {
      const existsSpy = jest
        .spyOn(model, 'exists')
        .mockImplementation((filter: any) => {
          return {
            exec: jest.fn().mockResolvedValue({
              _id: 'test',
            } as any),
          } as any;
        });
      const result = await lastValueFrom(
        service.existsByEmail('amr@example.com'),
      );

      expect(existsSpy).toBeCalledWith({ email: 'amr@example.com' });
      expect(existsSpy).toBeCalledTimes(1);
      expect(result).toBeTruthy();
    });

    it('should return false if not exists ', async () => {
      const existsSpy = jest
        .spyOn(model, 'exists')
        .mockImplementation((filter: any) => {
          return {
            exec: jest.fn().mockResolvedValue(null),
          } as any;
        });
      const result = await lastValueFrom(
        service.existsByEmail('amr@example.com'),
      );

      expect(existsSpy).toBeCalledWith({ email: 'amr@example.com' });
      expect(existsSpy).toBeCalledTimes(1);
      expect(result).toBeFalsy();
    });
  });
});
