import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  Scope
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Device } from '../database/device.model';
import { ParseObjectIdPipe } from '../shared/pipe/parse-object-id.pipe';
import { CreateDeviceDto } from './create-device.dto';
import { DeviceService } from './device.service';
import { UpdateDeviceDto } from './update-device.dto';

@Controller({ path: 'devices', scope: Scope.REQUEST })
export class DeviceController {
  constructor(private deviceService: DeviceService) { }

  @Get('')
  getAllDevices(
    @Query('q') keyword?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
  ): Observable<Device[]> {
    return this.deviceService.findAll(keyword, skip, limit);
  }

  @Get(':id')
  getDeviceById(@Param('id', ParseObjectIdPipe) id: string): Observable<Device> {
    return this.deviceService.findById(id);
  }

  @Post('')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @HasRoles(RoleType.USER, RoleType.ADMIN)
  createDevice(
    @Body() data: CreateDeviceDto,
    @Res() res: Response,
  ): Observable<Response> {
    return this.deviceService.save(data).pipe(
      map((device: Device) => {
        return res
          .status(201)
          .send({id: device._id});
      }),
    );
  }

  @Put(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @HasRoles(RoleType.USER, RoleType.ADMIN)
  updateDevice(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() device: UpdateDeviceDto,
    @Res() res: Response,
  ): Observable<Response> {
    return this.deviceService.update(id, device).pipe(
      map(() => {
        return res.status(200).send();
      }),
    );
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @HasRoles(RoleType.ADMIN)
  deleteDeviceById(
    @Param('id', ParseObjectIdPipe) id: string,
    @Res() res: Response,
  ): Observable<Response> {
    return this.deviceService.deleteById(id).pipe(
      map(() => {
        return res.status(200).send({message: `device with id: ${id} Deleted.`});
      }),
    );
  }

}
