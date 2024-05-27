import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDictionaryDto {
  @ApiProperty({ example: '사과', description: '단어 그자체를 입력' })
  @IsString()
  id: string;

  @ApiProperty({
    example: '명사',
    description: '품사의 종류',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: '~ 한 뜻이다.',
    description: '뜻에 대하여 설명',
  })
  @IsString()
  mean: string;

  @ApiProperty({
    example: '입력된 횟 수',
    description: '입력될 때마다 +1 됨.',
  })
  @IsOptional()
  @IsNumber()
  hit: number;

  @ApiProperty({
    example: true,
    description: '왁타버스 관련 단어일 경우, true 아니면 false',
  })
  @IsString()
  wakta: boolean;

  @ApiProperty({
    example: { bgm: 'url' },
    description: 'url, bgm 정보',
  })
  @IsOptional()
  @IsJSON()
  meta: any;
}
