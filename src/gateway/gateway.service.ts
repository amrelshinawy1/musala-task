import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { GATEWAY_MODEL } from '../database/database.constants';
import { Gateway } from '../database/gateway.model';
import { CreateGatewayDto } from './create-gateway.dto';
import { UpdateGatewayDto } from './update-gateway.dto';

@Injectable({ scope: Scope.REQUEST })
export class GatewayService {
  constructor(
    @Inject(GATEWAY_MODEL) private gatewayModel: Model<Gateway>,
  ) { }

  findAll(keyword?: string, skip = 0, limit = 10): Observable<Gateway[]> {
    if (keyword) {
      return from(
        this.gatewayModel
          .find({ name: { $regex: '.*' + keyword + '.*' } })
          .skip(skip)
          .limit(limit)
          .exec(),
      );
    } else {
      return from(this.gatewayModel.find({}).skip(skip).limit(limit).exec());
    }
  }

  findById(id: string): Observable<Gateway> {
    return from(this.gatewayModel.findOne({ _id: id }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`gateway:$id was not found`)),
    );
  }

  save(data: CreateGatewayDto): Observable<Gateway> {
    //console.log('req.user:'+JSON.stringify(this.req.user));
    const createGateway: Promise<Gateway> = this.gatewayModel.create({
      ...data,
    });
    return from(createGateway);
  }

  update(id: string, data: UpdateGatewayDto): Observable<Gateway> {
    return from(
      this.gatewayModel
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

  deleteById(id: string): Observable<Gateway> {
    return from(this.gatewayModel.findOneAndDelete({ _id: id }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`gateway:$id was not found`)),
    );
  }

  deleteAll(): Observable<any> {
    return from(this.gatewayModel.deleteMany({}).exec());
  }  
}
