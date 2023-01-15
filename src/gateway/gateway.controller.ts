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
import { Gateway } from '../database/gateway.model';
import { ParseObjectIdPipe } from '../shared/pipe/parse-object-id.pipe';
import { CreateGatewayDto } from './create-gateway.dto';
import { GatewayService } from './gateway.service';
import { UpdateGatewayDto } from './update-gateway.dto';

@Controller({ path: 'gateways', scope: Scope.REQUEST })
export class GatewayController {
  constructor(private gatewayService: GatewayService) { }

  @Get('')
  getAllGateways(
    @Query('q') keyword?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
  ): Observable<Gateway[]> {
    return this.gatewayService.findAll(keyword, skip, limit);
  }

  @Get(':id')
  getGatewayById(@Param('id', ParseObjectIdPipe) id: string): Observable<Gateway> {
    return this.gatewayService.findById(id);
  }

  @Post('')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @HasRoles(RoleType.USER, RoleType.ADMIN)
  createGateway(
    @Body() gateway: CreateGatewayDto,
    @Res() res: Response,
  ): Observable<Response> {
    return this.gatewayService.save(gateway).pipe(
      map((gateway: Gateway) => {
        return res
          .status(201)
          .send({id: gateway._id });
      }),
    );
  }

  @Put(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @HasRoles(RoleType.USER, RoleType.ADMIN)
  updateGateway(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() gateway: UpdateGatewayDto,
    @Res() res: Response,
  ): Observable<Response> {
    return this.gatewayService.update(id, gateway).pipe(
      map(() => {
        return res.status(200).send();
      }),
    );
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @HasRoles(RoleType.ADMIN)
  deleteGatewayById(
    @Param('id', ParseObjectIdPipe) id: string,
    @Res() res: Response,
  ): Observable<Response> {
    return this.gatewayService.deleteById(id).pipe(
      map(() => {
        return res.status(200).send({message: `gateway with id: ${id} Deleted.`});
      }),
    );
  }

}
