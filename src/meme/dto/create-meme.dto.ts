import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsJSON, IsOptional, IsString } from 'class-validator';

export class CreateMemeDto {
  @ApiProperty({ example: '사과', description: '단어 그자체를 입력' })
  @IsString()
  id: string;

  @ApiProperty({
    example: '~ 한 뜻이다.',
    description: '뜻에 대하여 설명',
  })
  @IsString()
  mean: string;

  @ApiProperty({
    example: ['콘서트'],
    description: '힌트 정보',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hint: string[];

  @ApiProperty({
    example: ['고멤', '우왁굳'],
    description: '관련인물 태그 값',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tag: string[];

  @ApiProperty({
    example: 'ㅇㅇㄱ',
    description: '그 밈의 초성',
  })
  @IsString()
  choseong: string;

  @ApiProperty({
    example: { bgm: 'url' },
    description: 'url, bgm 정보',
  })
  @IsOptional()
  @IsJSON()
  meta: any;
}
