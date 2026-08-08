import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PurchaseItemDto {
  @ApiProperty({ example: 'avatar:hat:starter-red' })
  @IsString()
  catalogItemId: string;
}
