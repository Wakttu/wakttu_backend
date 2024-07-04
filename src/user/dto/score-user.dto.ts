import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ScoreUserDto {
  @ApiProperty({
    example: 500,
    description: '경험치로 올라갈 점수 수치 +500',
  })
  @IsNumber()
  score: number;
}
