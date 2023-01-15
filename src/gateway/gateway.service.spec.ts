import { Test, TestingModule } from '@nestjs/testing';
import { FilterQuery, Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { GATEWAY_MODEL } from '../database/database.constants';
import { Gateway } from '../database/gateway.model';
import { GatewayService } from './gateway.service';

describe('GatewayService', () => {
  let service: GatewayService;
  let model: Model<Gateway>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayService,
        {
          provide: GATEWAY_MODEL,
          useValue: {
            new: jest.fn(),
            constructor: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
            deleteMany: jest.fn(),
            deleteOne: jest.fn(),
            updateOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = await module.resolve<GatewayService>(GatewayService);
    model = module.get<Model<Gateway>>(GATEWAY_MODEL);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all gateways', async () => {
    const gateways = [
      {
        _id: '5ee49c3115a4e75254bb732e',
        serial: '123_456_789',
        name: 'gateway 1',
        ip4address: '192.168.0.1'
      },
      {
        _id: '5ee49c3115a4e75254bb732f',
        serial: '123_456_789',
        name: 'gateway 1',
        ip4address: '192.168.0.1'
      },
      {
        _id: '5ee49c3115a4e75254bb7330',
        serial: '123_456_789',
        name: 'gateway 1',
        ip4address: '192.168.0.1'
      },
    ];
    jest.spyOn(model, 'find').mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(gateways) as any,
        }),
      }),
    } as any);

    const data = await lastValueFrom(service.findAll());
    expect(data.length).toBe(3);
    expect(model.find).toHaveBeenCalled();

    jest
      .spyOn(model, 'find')
      .mockImplementation(
        (
          conditions: FilterQuery<Gateway>,
          callback?: (err: any, res: Gateway[]) => void,
        ) => {
          return {
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([gateways[0]]),
              }),
            }),
          } as any;
        },
      );

    const result = await lastValueFrom(service.findAll('Generate', 0, 10));
    expect(result.length).toBe(1);
    expect(model.find).lastCalledWith({
      name: { $regex: '.*' + 'Generate' + '.*' },
    });
  });

  describe('findByid', () => {
    it('if exists return one gateway', (done) => {
      const found = {
        _id: '5ee49c3115a4e75254bb732e',
        serial: '123_456_789',
        name: 'gateway 1',
        ip4address: '192.168.0.1'
      };

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(found) as any,
      } as any);

      service.findById('1').subscribe({
        next: (data) => {
          expect(data._id).toBe('5ee49c3115a4e75254bb732e');
          expect(data.name).toEqual('gateway 1');
        },
        error: (error) => console.log(error),
        complete: done(),
      });
    });

    it('if not found throw an NotFoundException', (done) => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null) as any,
      } as any);

      service.findById('1').subscribe({
        next: (data) => {
          console.log(data);
        },
        error: (error) => {
          expect(error).toBeDefined();
        },
        complete: done(),
      });
    });
  });

  it('should save gateway', async () => {
    const toCreated = {
      serial: '123_456_789',
      name: 'gateway 1',
      ip4address: '192.168.0.1'
  };

    const toReturned = {
      _id: '5ee49c3115a4e75254bb732e',
      ...toCreated,
    } as Gateway;

    jest
      .spyOn(model, 'create')
      .mockImplementation(() => Promise.resolve(toReturned));

    const data = await lastValueFrom(service.save(toCreated));
    expect(data._id).toBe('5ee49c3115a4e75254bb732e');
    expect(model.create).toBeCalledWith({
      ...toCreated,
    });
    expect(model.create).toBeCalledTimes(1);
  });

  describe('update', () => {
    it('perform update if gateway exists', (done) => {
      const toUpdated = {
        _id: '5ee49c3115a4e75254bb732e',
        serial: '123_456_789',
        name: 'gateway 1',
        ip4address: '192.168.0.1'
      };

      jest.spyOn(model, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(toUpdated) as any,
      } as any);

      service.update('5ee49c3115a4e75254bb732e', toUpdated).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
          expect(model.findOneAndUpdate).toBeCalled();
        },
        error: (error) => console.log(error),
        complete: done(),
      });
    });

    it('throw an NotFoundException if gateway not exists', (done) => {
      const toUpdated = {
        _id: '5ee49c3115a4e75254bb732e',
        serial: '123_456_789',
        name: 'gateway 1',
        ip4address: '192.168.0.1'
      };
      jest.spyOn(model, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null) as any,
      } as any);

      service.update('5ee49c3115a4e75254bb732e', toUpdated).subscribe({
        error: (error) => {
          expect(error).toBeDefined();
          expect(model.findOneAndUpdate).toHaveBeenCalledTimes(1);
        },
        complete: done(),
      });
    });
  });

  describe('delete', () => {
    it('perform delete if gateway exists', (done) => {
      const toDeleted = {
        _id: '5ee49c3115a4e75254bb732e',
        serial: '123_456_789',
        name: 'gateway 1',
        ip4address: '192.168.0.1'
      };
      jest.spyOn(model, 'findOneAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(toDeleted),
      } as any);

      service.deleteById('anystring').subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
          expect(model.findOneAndDelete).toBeCalled();
        },
        error: (error) => console.log(error),
        complete: done(),
      });
    });

    it('throw an NotFoundException if gateway not exists', (done) => {
      jest.spyOn(model, 'findOneAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      service.deleteById('anystring').subscribe({
        error: (error) => {
          expect(error).toBeDefined();
          expect(model.findOneAndDelete).toBeCalledTimes(1);
        },
        complete: done(),
      });
    });
  });

  it('should delete all gateway', (done) => {
    jest.spyOn(model, 'deleteMany').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce({
        deletedCount: 1,
      }),
    } as any);

    service.deleteAll().subscribe({
      next: (data) => expect(data).toBeTruthy,
      error: (error) => console.log(error),
      complete: done(),
    });
  });

});
