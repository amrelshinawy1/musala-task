import { Observable, of } from 'rxjs';
import { Device, Status } from '../database/device.model';
import { Gateway } from '../database/gateway.model';
import { CreateGatewayDto } from './create-gateway.dto';
import { GatewayService } from './gateway.service';
import { UpdateGatewayDto } from './update-gateway.dto';

export class GatewayServiceStub implements Pick<GatewayService, keyof GatewayService> {
  private gateways: Gateway[] = [
    {
      _id: '5ee49c3115a4e75254bb732e',
      serial: '123_456_789',
      ip4address: '12345678912456',
      name: 'gateway 1'
    } as Gateway,
    {
      _id: '5ee49c3115a4e75254bb732f',
      serial: '123_456_789',
      ip4address: '12345678912456',
      name: 'gateway 2'
    } as Gateway,
    {
      _id: '5ee49c3115a4e75254bb7330',
      serial: '123_456_789',
      ip4address: '12345678912456',
      name: 'gateway 3'
    } as Gateway,
  ];

  private devices: Device[] = [
    {
      uid: '1',
      status: Status.OFFLINE,
      vendor: 'test vendor'
    } as Device,
  ];

  findAll(): Observable<Gateway[]> {
    return of(this.gateways);
  }

  findById(id: string): Observable<Gateway> {
    const { serial, name, ip4address } = this.gateways[0];
    return of({ _id: id, serial, name, ip4address } as Gateway);
  }

  save(data: CreateGatewayDto): Observable<Gateway> {
    return of({ _id: this.gateways[0]._id, ...data } as Gateway);
  }

  update(id: string, data: UpdateGatewayDto): Observable<Gateway> {
    return of({ _id: id, ...data } as Gateway);
  }

  deleteById(id: string): Observable<Gateway> {
    return of({ _id: id, name: 'gateway 1', serial: '123_456_789' } as Gateway);
  }

  deleteAll(): Observable<any> {
    throw new Error('Method not implemented.');
  }
}
