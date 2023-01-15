import { IsString } from "class-validator";

export class UpdateDeviceDto {
  @IsString()
  readonly status?: string;
  
  @IsString()
  readonly vendor?: string;
  
  @IsString()
  readonly uid?: string;

  
  @IsString()
  readonly gatewayId?: string;
}
