import { IsNotEmpty } from "class-validator";

export class UpdateGatewayDto {

  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  readonly serial: string;

  @IsNotEmpty()
  readonly ip4address: string;
}
