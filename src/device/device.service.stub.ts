import { Observable, of } from 'rxjs';
import { Device, Status } from '../database/device.model';
import { CreateDeviceDto } from './create-device.dto';
import { DeviceService } from './device.service';
import { UpdateDeviceDto } from './update-device.dto';

export class DeviceServiceStub implements Pick<DeviceService, keyof DeviceService> {
  private devices: Device[] = [
    {
      _id: '5ee49c3115a4e75254bb732e',
      uid: '123',
      vendor: '123_456_789',
      status: Status.OFFLINE,
    } as Device,
    {
      _id: '5ee49c3115a4e75254bb733e',
      uid: '123',
      vendor: '123_456_789',
      status: Status.OFFLINE,
    } as Device,
    {
      _id: '5ee49c3115a4e75254bb734e',
      uid: '123',
      vendor: '123_456_789',
      status: Status.OFFLINE,
    } as Device,
  ];

  findAll(): Observable<Device[]> {
    return of(this.devices);
  }

  findById(id: string): Observable<Device> {
    const { vendor, uid, status } = this.devices[0];
    return of({ _id: id, vendor, uid, status } as Device);
  }

  save(data: CreateDeviceDto): Observable<Device> {
    const { gatewayId, vendor, uid, status } = data;

    return of({ _id: this.devices[0]._id, vendor, uid, status, gateway:{_id:gatewayId} } as Device);
  }

  update(id: string, data: UpdateDeviceDto): Observable<Device> {
    const { vendor, uid, status } = data;

    return of({ _id: id, vendor, uid, status} as Device);
  }

  deleteById(id: string): Observable<Device> {
    return of({ _id: id } as Device);
  }

  deleteAll(): Observable<any> {
    throw new Error('Method not implemented.');
  }

}
