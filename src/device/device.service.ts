import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { DEVICE_MODEL } from '../database/database.constants';
import { Device } from '../database/device.model';
import { CreateDeviceDto } from './create-device.dto';
import { UpdateDeviceDto } from './update-device.dto';

@Injectable({ scope: Scope.REQUEST })
export class DeviceService {
  constructor(
    @Inject(DEVICE_MODEL) private deviceModel: Model<Device>,
  ) { }

  findAll(keyword?: string, skip = 0, limit = 10): Observable<Device[]> {
    if (keyword) {
      return from(
        this.deviceModel
          .find({ vendor: { $regex: '.*' + keyword + '.*' } })
          .skip(skip)
          .limit(limit)
          .exec(),
      );
    } else {
      return from(this.deviceModel.find({}).skip(skip).limit(limit).exec());
    }
  }

  findById(id: string): Observable<Device> {
    return from(this.deviceModel.findOne({ _id: id }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`gateway:$id was not found`)),
    );
  }

  save(data: CreateDeviceDto): Observable<Device> {
    // should also add to set by push the new device to the gateway devices array if needed 

    const{gatewayId: deviceId,status, uid,vendor} = data; 
    const createdDevice: Promise<Device> = this.deviceModel.create({
      gateway: { _id: deviceId },
      status, uid,vendor
    });
    return from(createdDevice);
  }

  update(id: string, data: UpdateDeviceDto): Observable<Device> {
    return from(
      this.deviceModel
        .findOneAndUpdate(
          { _id: id },
          data,
          { new: true },
        )
        .exec(),
    ).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`gateway:$id was not found`)),
    );
  }

  deleteById(id: string): Observable<Device> {
    return from(this.deviceModel.findOneAndDelete({ _id: id }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`gateway:$id was not found`)),
    );
  }

  deleteAll(): Observable<any> {
    return from(this.deviceModel.deleteMany({}).exec());
  }  
}
