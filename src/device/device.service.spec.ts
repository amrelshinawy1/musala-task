import { Test, TestingModule } from "@nestjs/testing";
import { FilterQuery, Model } from "mongoose";
import { lastValueFrom } from "rxjs";
import { DEVICE_MODEL } from "../database/database.constants";
import { Device, Status } from "../database/device.model";
import { DeviceService } from "./device.service";

describe('DeviceService', () => {
  let service: DeviceService;
  let model: Model<Device>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceService,
        {
          provide: DEVICE_MODEL,
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
        }
      ],
    }).compile();

    service = await module.resolve<DeviceService>(DeviceService);
    model = module.get<Model<Device>>(DEVICE_MODEL);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all devices', async () => {
    const devices = [
      {
        _id: '5ee49c3115a4e75254bb732e',
        uid: '123_456_789',
        vendor: 'device 1',
        status: Status.OFFLINE,
        gatewayId: '1'
      },
      {
        _id: '5ee49c3115a4e75254bb732f',
        uid: '123_456_789',
        vendor: 'device 1',
        status: Status.OFFLINE,
        gatewayId: '1'
      },
      {
        _id: '5ee49c3115a4e75254bb7330',
        uid: '123_456_789',
        vendor: 'device 1',
        status: Status.OFFLINE,
        gatewayId: '1'
      },
    ];
    jest.spyOn(model, 'find').mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(devices) as any,
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
          conditions: FilterQuery<Device>,
          callback?: (err: any, res: Device[]) => void,
        ) => {
          return {
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([devices[0]]),
              }),
            }),
          } as any;
        },
      );

    const result = await lastValueFrom(service.findAll('Generate', 0, 10));
    expect(result.length).toBe(1);
    expect(model.find).lastCalledWith({
      vendor: { $regex: '.*' + 'Generate' + '.*' },
    });
  });

  describe('findByid', () => {
    it('if exists return one device', (done) => {
      const found = {
        _id: '5ee49c3115a4e75254bb732e',
        uid: '123_456_789',
        vendor: 'device 1',
        status: Status.OFFLINE,
        gatewayId: '1'
      };

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(found) as any,
      } as any);

      service.findById('1').subscribe({
        next: (data) => {
          expect(data._id).toBe('5ee49c3115a4e75254bb732e');
          expect(data.vendor).toEqual('device 1');
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

  it('should save device', async () => {
    const toCreated = {
      uid: '123_456_789',
      vendor: 'device 1',
      status: Status.OFFLINE,
      gatewayId: '1'
    };

    const toReturned = {
      _id: '5ee49c3115a4e75254bb732e',
      uid: '123_456_789',
      vendor: 'device 1',
      status: Status.OFFLINE,
      gateway: { _id: '1' }
    } as Device;

    jest
      .spyOn(model, 'create')
      .mockImplementation(() => Promise.resolve(toReturned));

    const data = await lastValueFrom(service.save(toCreated));
    expect(data._id).toBe('5ee49c3115a4e75254bb732e');
    expect(model.create).toBeCalledWith({
      "gateway": {
        "_id": "1",
      },
      "status": "OFFLINE",
      "uid": "123_456_789",
      "vendor": "device 1",
    });
    expect(model.create).toBeCalledTimes(1);
  });

  describe('update', () => {
    it('perform update if device exists', (done) => {
      const toUpdated = {
        _id: '5ee49c3115a4e75254bb732e',
        serial: '123_456_789',
        name: 'device 1',
        ip4address: '192.168.0.1'
      };

      jest.spyOn(model, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(toUpdated) as any,
      } as any);

      service.update('5ee49c3115a4e75254bb732e', { status: Status.ONLINE }).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
          expect(model.findOneAndUpdate).toBeCalled();
        },
        error: (error) => console.log(error),
        complete: done(),
      });
    });

    it('throw an NotFoundException if device not exists', (done) => {
      const toUpdated = {
        _id: '5ee49c3115a4e75254bb732e',
        serial: '123_456_789',
        name: 'device 1',
        ip4address: '192.168.0.1'
      };
      jest.spyOn(model, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null) as any,
      } as any);

      service.update('5ee49c3115a4e75254bb732e', { status: Status.OFFLINE }).subscribe({
        error: (error) => {
          expect(error).toBeDefined();
          expect(model.findOneAndUpdate).toHaveBeenCalledTimes(1);
        },
        complete: done(),
      });
    });
  });

  describe('delete', () => {
    it('perform delete if device exists', (done) => {
      const toDeleted = {
        _id: '5ee49c3115a4e75254bb732e',
        uid: '123_456_789',
        vendor: 'device 1',
        status: Status.OFFLINE,
        gatewayId: '1'
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

    it('throw an NotFoundException if device not exists', (done) => {
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

  it('should delete all device', (done) => {
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

  it('should create device ', async () => {
    const device = { gatewayId: '1', uid: '1', vendor: 'test vendor', status: Status.OFFLINE };
    jest.spyOn(model, 'create').mockImplementation(() =>
      Promise.resolve({
        ...device,
      } as any),
    );

    const result = await lastValueFrom(
      service.save(device),
    );
    expect(result.status).toEqual(Status.OFFLINE);
    expect(model.create).toBeCalledWith({
      uid: '1', vendor: 'test vendor', status: Status.OFFLINE,
      gateway: { _id: '1' },
    });
  });

});
