import { IsIP, IsNotEmpty, IsString } from 'class-validator';
export class CreateGatewayDto {

  @IsString()
  @IsNotEmpty()
  readonly name: string;
  
  @IsString()
  @IsNotEmpty()
  readonly serial: string;

  @IsIP()
  readonly ip4address: string;
}
