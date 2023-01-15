import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { lastValueFrom, Observable, of } from 'rxjs';
import { anyNumber, anyString, instance, mock, verify, when } from 'ts-mockito';
import { Device, Status } from '../database/device.model';
import { CreateDeviceDto } from './create-device.dto';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { DeviceServiceStub } from './device.service.stub';
import { UpdateDeviceDto } from './update-device.dto';

describe('Device Controller', () => {
  describe('Replace DeviceService in provider(useClass: DeviceServiceStub)', () => {
    let controller: DeviceController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: DeviceService,
            useClass: DeviceServiceStub,
          },
        ],
        controllers: [DeviceController],
      }).compile();

      controller = await module.resolve<DeviceController>(DeviceController);
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('GET on /devices should return all devices', async () => {
      const devices = await lastValueFrom(controller.getAllDevices());
      expect(devices.length).toBe(3);
    });

    it('GET on /devices/:id should return one device ', (done) => {
      controller.getDeviceById('1').subscribe((data) => {
        expect(data._id).toEqual('1');
        done();
      });
    });

    it('POST on /devices should save device', async () => {
      const device: CreateDeviceDto = {
        uid: '123_456_789',
        vendor: 'device 1',
        status: Status.OFFLINE,
        gatewayId: '1'
  };
      const saved = await lastValueFrom(
        controller.createDevice(
          device,
          createMock<Response>({
            status: jest.fn().mockReturnValue({
              send: jest.fn().mockReturnValue({
                status: 201,
              }),
            }),
          }),
        ),
      );
      // console.log(saved);
      expect(saved.status).toBe(201);
    });

    it('PUT on /devices/:id should update the existing device', (done) => {
      const device: UpdateDeviceDto = {
        uid: '123_456_789',
        vendor: 'device 1',
        status: Status.OFFLINE
  };
      controller
        .updateDevice(
          '1',
          device,
          createMock<Response>({
            status: jest.fn().mockReturnValue({
              send: jest.fn().mockReturnValue({
                status: 204,
              }),
            }),
          }),
        )
        .subscribe((data) => {
          expect(data.status).toBe(204);
          done();
        });
    });

    it('DELETE on /devices/:id should delete device', (done) => {
      controller
        .deleteDeviceById(
          '1',
          createMock<Response>({
            status: jest.fn().mockReturnValue({
              send: jest.fn().mockReturnValue({
                status: 204,
              }),
            }),
          }),
        )
        .subscribe((data) => {
          expect(data).toBeTruthy();
          done();
        });
    });

    it('POST on /devices/:id/devices', async () => {
      const result = await lastValueFrom(
        controller.createDevice(
          { gatewayId: '1', status: 'OFFLINE', uid: '1', vendor: 'testdevice' },
          createMock<Response>({
            status: jest.fn().mockReturnValue({
              send: jest.fn().mockReturnValue({
                status: 201,
              }),
            }),
          }),
        ),
      );

      expect(result.status).toBe(201);
    });

    it('GET on /devices/:id/devices', async () => {
      const result = await lastValueFrom(
        controller.getAllDevices('testdevice'),
      );

      expect(result.length).toBe(3);
    });
  });

  describe('Replace DeviceService in provider(useValue: fake object)', () => {
    let controller: DeviceController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: DeviceService,
            useValue: {
              findAll: (_keyword?: string, _skip?: number, _limit?: number) =>
                of<any[]>([
                  {
                    _id: 'testid',
                    uid: '123_456_789',
                    vendor: 'device 1',
                    status: Status.OFFLINE,
                    gatewayId: '1'
                                      },
                ]),
            },
          },
        ],
        controllers: [DeviceController],
      }).compile();

      controller = await module.resolve<DeviceController>(DeviceController);
    });

    it('should get all devices(useValue: fake object)', async () => {
      const result = await lastValueFrom(controller.getAllDevices());
      expect(result[0]._id).toEqual('testid');
    });
  });

  describe('Replace DeviceService in provider(useValue: jest mocked object)', () => {
    let controller: DeviceController;
    let deviceService: DeviceService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: DeviceService,
            useValue: {
              constructor: jest.fn(),
              findAll: jest
                .fn()
                .mockImplementation(
                  (_keyword?: string, _skip?: number, _limit?: number) =>
                    of<any[]>([
                      {
                        _id: 'testid',
                        uid: '123_456_789',
                        vendor: 'device 1',
                        status: Status.OFFLINE,
                        gatewayId: '1'
                                                  },
                    ]),
                ),
            },
          },
        ],
        controllers: [DeviceController],
      }).compile();

      controller = await module.resolve<DeviceController>(DeviceController);
      deviceService = module.get<DeviceService>(DeviceService);
    });

    it('should get all devices(useValue: jest mocking)', async () => {
      const result = await lastValueFrom(controller.getAllDevices('test', 10, 0));
      expect(result[0]._id).toEqual('testid');
      expect(deviceService.findAll).toBeCalled();
      expect(deviceService.findAll).lastCalledWith('test', 0, 10);
    });
  });

  describe('Mocking DeviceService using ts-mockito', () => {
    let controller: DeviceController;
    const mockedDeviceService: DeviceService = mock(DeviceService);

    beforeEach(async () => {
      controller = new DeviceController(instance(mockedDeviceService));
    });

    it('should get all devices(ts-mockito)', async () => {
      when(
        mockedDeviceService.findAll(anyString(), anyNumber(), anyNumber()),
      ).thenReturn(
        of([
          {
            _id: 'testid',
            uid: '123_456_789',
            vendor: 'device 1',
            status: Status.OFFLINE,
            gateway: {_id: '1'}
          },
        ]) as Observable<Device[]>,
      );
      const result = await lastValueFrom(controller.getAllDevices('', 10, 0));
      expect(result.length).toEqual(1);
      expect(result[0].vendor).toBe('device 1');
      verify(
        mockedDeviceService.findAll(anyString(), anyNumber(), anyNumber()),
      ).once();
    });
  });
});
