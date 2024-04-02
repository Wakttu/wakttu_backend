import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Xefafadvmmd',
    description: 'this is id of User',
  })
  id: string;

  @ApiProperty({
    example: '냐무냠',
    description: 'this is name of User',
  })
  name: string;

  @ApiProperty({
    example: 'http://www.image.png',
    description: 'this is image-URL of User',
  })
  image: string;

  @ApiProperty({
    example: 'naver',
    description: 'this is provider of User',
  })
  provider: string;

  @ApiProperty({
    description: 'this is password of User. ',
  })
  password: string | undefined;
}
