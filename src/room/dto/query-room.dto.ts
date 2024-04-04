import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryRoomDto {
  @ApiProperty({
    example: '초보만 오세요',
    description: '게임 room의 방제목',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 6,
    description: '가져올 데이터 개수',
  })
  @IsOptional()
  @IsNumber()
  take: number;

  @ApiProperty({
    example: 6,
    description: '스킵하는 데이터 개수',
  })
  @IsOptional()
  @IsNumber()
  skip: number;

  @ApiProperty({
    example: true,
    description: '게임 중 포함 미포함',
  })
  @IsOptional()
  @IsBoolean()
  start: number;

  @ApiProperty({
    example: '[1,0,1,0,1]',
    description: '방의 옵션을 키고 끄는 내용을 정할수 있음.',
  })
  @IsOptional()
  @IsBoolean({ each: true })
  option: boolean[];
}
