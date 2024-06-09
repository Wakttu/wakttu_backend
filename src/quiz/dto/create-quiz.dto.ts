import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateQuizDto {
  @ApiProperty({
    example: '단답형',
    description: '단답형, 사지선다형 등 문제의 유형',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: '~를 의미하는 왁타버스 밈단어는?',
    description: '단어에 대하여 문제',
  })
  @IsString()
  qestion: string;

  @ApiProperty({
    example: '품어',
    description: '문제의 답을 담고있는 colum',
  })
  @IsArray()
  @IsString({ each: true })
  answer: string[];

  @ApiProperty({
    example: '해설이 들어가는 부분',
    description: '문제의 해설이 들어가는 부분입니다.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: ['이걸모르면 짭치죠.', '아프리카 넘어와서 유행해진 말입니다!'],
    description: '게임에서 주어질 힌트',
  })
  @IsArray()
  @IsString({ each: true })
  hint: string[];

  @ApiProperty({
    example: ['노래', '이세돌'],
    description: '정답에 관한 인물 혹은 단어에 관한 tag정보',
  })
  @IsArray()
  @IsString({ each: true })
  tag: string[];
}
