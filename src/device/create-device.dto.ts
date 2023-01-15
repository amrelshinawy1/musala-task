import { IsNotEmpty, IsString } from 'class-validator';
export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  readonly status: string;
  
  @IsString()
  @IsNotEmpty()
  readonly vendor: string;
  
  @IsString()
  @IsNotEmpty()
  readonly uid: string;

  
  @IsString()
  @IsNotEmpty()
  readonly gatewayId: string;
}
