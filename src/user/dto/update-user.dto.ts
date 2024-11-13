import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: ['https://placehold.co/600x400', 'https://placehold.co/1200x600'],
    description: 'emoji url 주소 배열',
  })
  @IsOptional()
  @IsString({ each: true })
  keyboard?: string[];

  @ApiProperty({
    example: { skin: 'S-1', hand: 'H-2', head: 'HA-1', eye: 'E-6' },
    description: '캐릭터 정보',
  })
  @IsObject()
  character?: object;
}
