import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Xefafadvmmd',
    description: 'this is id of User',
  })
  @Matches(RegExp(/^[A-Za-z0-9]{5,12}$/), {
    message: '영문과 숫자를 합쳐 5자이상 12자 이하만 가능합니다!',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: '냐무냠',
    description: 'this is name of User',
  })
  @Matches(RegExp(/^[가-힣A-Za-z]{2,10}$/), {
    message: '영문과 한글을 합쳐 2자이상 10자 이하만 가능합니다!',
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
  @Matches(RegExp(/^.{8,16}$/), {
    message: '8자이상 16자 이하만 가능합니다!',
  })
  @IsOptional()
  @IsString()
  password: string | undefined;
}
