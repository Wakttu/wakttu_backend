import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: 'Xefafadvmmd',
    description: 'this is email of User',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'this is password of User. ',
  })
  @IsString()
  password: string | undefined;
}
