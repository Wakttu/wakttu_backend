import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateDictionaryDto {
  @ApiProperty({ example: '사과', description: '단어 그자체를 입력' })
  @IsString()
  id: string;

  @ApiProperty({
    example: '1,1',
    description:
      '품사의 종류에 따라 번호 부여. 1=>명사 품사가 여러개일 경우 그에 따라 ,를 통해 추가',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: '{1}, [1], 1',
    description: '사용안할 예정. 왜냐면 의미의 경우 저작권이 존재',
  })
  @IsString()
  mean: string;

  @ApiProperty({
    example: '2',
    description: '먼용도인지모르겠음',
  })
  @IsNumber()
  flag: number;

  @ApiProperty({
    example: '320',
    description: '번호를 통해 주제를 나눔, 나중에 다른 방식으로 수정예정',
  })
  @IsString()
  theme: string;
}
