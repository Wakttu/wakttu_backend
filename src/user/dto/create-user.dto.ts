import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Xefafadvmmd',
    description: 'this is id of User',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: '냐무냠',
    description: 'this is name of User',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'naver',
    description: 'this is provider of User',
  })
  @IsOptional()
  @IsString()
  provider: string;

  @ApiProperty({
    description: 'this is password of User. ',
  })
  @IsOptional()
  @IsString()
  password: string | undefined;
}
