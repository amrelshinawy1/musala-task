import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { lastValueFrom, Observable, of } from 'rxjs';
import { anyNumber, anyString, instance, mock, verify, when } from 'ts-mockito';
import { Gateway } from '../database/gateway.model';
import { CreateGatewayDto } from './create-gateway.dto';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { GatewayServiceStub } from './gateway.service.stub';
import { UpdateGatewayDto } from './update-gateway.dto';

describe('Gateway Controller', () => {
  describe('Replace GatewayService in provider(useClass: GatewayServiceStub)', () => {
    let controller: GatewayController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: GatewayService,
            useClass: GatewayServiceStub,
          },
        ],
        controllers: [GatewayController],
      }).compile();

      controller = await module.resolve<GatewayController>(GatewayController);
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('GET on /gateways should return all gateways', async () => {
      const gateways = await lastValueFrom(controller.getAllGateways());
      expect(gateways.length).toBe(3);
    });

    it('GET on /gateways/:id should return one gateway ', (done) => {
      controller.getGatewayById('1').subscribe((data) => {
        expect(data._id).toEqual('1');
        done();
      });
    });

    it('POST on /gateways should save gateway', async () => {
      const gateway: CreateGatewayDto = {
        serial: '123_456_789',
        name: 'gateway 1',
        ip4address: '192.168.0.1'
      };
      const saved = await lastValueFrom(
        controller.createGateway(
          gateway,
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

    it('PUT on /gateways/:id should update the existing gateway', (done) => {
      const gateway: UpdateGatewayDto = {
        serial: '123_456_789',
        name: 'gateway 1',
        ip4address: '192.168.0.1'
      };
      controller
        .updateGateway(
          '1',
          gateway,
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

    it('DELETE on /gateways/:id should delete gateway', (done) => {
      controller
        .deleteGatewayById(
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
  });

  describe('Replace GatewayService in provider(useValue: fake object)', () => {
    let controller: GatewayController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: GatewayService,
            useValue: {
              findAll: (_keyword?: string, _skip?: number, _limit?: number) =>
                of<any[]>([
                  {
                    _id: 'testid',
                    serial: '123_456_789',
                    name: 'gateway 1',
                    ip4address: '192.168.0.1'
                              },
                ]),
            },
          },
        ],
        controllers: [GatewayController],
      }).compile();

      controller = await module.resolve<GatewayController>(GatewayController);
    });

    it('should get all gateways(useValue: fake object)', async () => {
      const result = await lastValueFrom(controller.getAllGateways());
      expect(result[0]._id).toEqual('testid');
    });
  });

  describe('Replace GatewayService in provider(useValue: jest mocked object)', () => {
    let controller: GatewayController;
    let gatewayService: GatewayService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: GatewayService,
            useValue: {
              constructor: jest.fn(),
              findAll: jest
                .fn()
                .mockImplementation(
                  (_keyword?: string, _skip?: number, _limit?: number) =>
                    of<any[]>([
                      {
                        _id: 'testid',
                        serial: '123_456_789',
                        name: 'gateway 1',
                        ip4address: '192.168.0.1'
                                      },
                    ]),
                ),
            },
          },
        ],
        controllers: [GatewayController],
      }).compile();

      controller = await module.resolve<GatewayController>(GatewayController);
      gatewayService = module.get<GatewayService>(GatewayService);
    });

    it('should get all gateways(useValue: jest mocking)', async () => {
      const result = await lastValueFrom(controller.getAllGateways('test', 10, 0));
      expect(result[0]._id).toEqual('testid');
      expect(gatewayService.findAll).toBeCalled();
      expect(gatewayService.findAll).lastCalledWith('test', 0, 10);
    });
  });

  describe('Mocking GatewayService using ts-mockito', () => {
    let controller: GatewayController;
    const mockedGatewayService: GatewayService = mock(GatewayService);

    beforeEach(async () => {
      controller = new GatewayController(instance(mockedGatewayService));
    });

    it('should get all gateways(ts-mockito)', async () => {
      when(
        mockedGatewayService.findAll(anyString(), anyNumber(), anyNumber()),
      ).thenReturn(
        of([
          {
            _id: 'testid',
            serial: '123_456_789',
            name: 'gateway 1',
            ip4address: '192.168.0.1'
          },
        ]) as Observable<Gateway[]>,
      );
      const result = await lastValueFrom(controller.getAllGateways('', 10, 0));
      expect(result.length).toEqual(1);
      expect(result[0].name).toBe('gateway 1');
      verify(
        mockedGatewayService.findAll(anyString(), anyNumber(), anyNumber()),
      ).once();
    });
  });
});
