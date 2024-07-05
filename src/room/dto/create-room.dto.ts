import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    example: '초보만 오세요',
    description: '게임 room의 방제목',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: '123456',
    description: '방의 비밀번호가 있을경우 입력가능',
  })
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty({
    example: '1',
    description:
      '게임종류에 따라 번호를 나눌예정 현재는 1번을 끝말잇기로 생각하자',
  })
  @IsNumber()
  type: number;

  @ApiProperty({
    example: '6',
    description: '라운드 수',
  })
  @IsNumber()
  round: number;

  @ApiProperty({
    example: '[매너, 품어]',
    description: '방의 옵션을 키고 끄는 내용을 정할수 있음.',
  })
  @IsOptional()
  @IsString({ each: true })
  option: string[];

  @ApiProperty({ example: '8', description: '인원수설정하는값' })
  @IsNumber()
  total: number;

  @ApiProperty({ example: '600000', description: '라운드 시간 ms 단위' })
  @IsOptional()
  @IsNumber()
  time: number;
}
