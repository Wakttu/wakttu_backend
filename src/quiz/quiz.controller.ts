import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quize.dto';

@ApiTags('Quiz')
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @ApiOperation({ summary: '퀴즈 추가' })
  @Post()
  async create(@Body() createQuizDto: CreateQuizDto) {
    return await this.quizService.create(createQuizDto);
  }
  @ApiOperation({ summary: '퀴즈 id 통해 검색' })
  @Get(':id')
  async findById(@Param('id') id: number) {
    return await this.quizService.findById(id);
  }

  @ApiOperation({ summary: '퀴즈 수정' })
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updatequizDto: UpdateQuizDto) {
    return await this.quizService.update(id, updatequizDto);
  }

  @ApiOperation({ summary: '퀴즈 삭제' })
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.quizService.remove(id);
  }

  @ApiOperation({ summary: '퀴즈 태그 통해 검색' })
  @Get('tag/:tag')
  async findByTag(@Param('tag') tag: string) {
    return await this.quizService.findByTag(tag);
  }

  @ApiOperation({ summary: '퀴즈 리스트 가져오기' })
  @Get('list/:take')
  async getList(@Param('take') take: string) {
    if (!take) take = '1';
    return await this.quizService.getList(Number(take));
  }
}
