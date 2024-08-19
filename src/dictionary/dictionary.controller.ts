import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';

@UseGuards(RolesGuard)
@ApiTags('Dictionary')
@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Roles(['manager', 'staff'])
  @ApiOperation({ summary: '사전 단어 추가' })
  @Post()
  async create(@Body() createDictionaryDto: CreateDictionaryDto) {
    return await this.dictionaryService.create(createDictionaryDto);
  }

  @ApiOperation({ summary: '단어 검색' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.dictionaryService.findById(id);
  }

  @Roles(['manager', 'staff'])
  @ApiOperation({ summary: '사전 단어 수정' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDictionaryDto: UpdateDictionaryDto,
  ) {
    return await this.dictionaryService.update(id, updateDictionaryDto);
  }

  @Roles(['manager'])
  @ApiOperation({ summary: '사전 단어 삭제' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.dictionaryService.remove(id);
  }

  @ApiOperation({ summary: '한방단어 인지 확인' })
  @Get('manner/:keyword')
  async checkManner(@Param('keyword') keyword: string) {
    return await this.dictionaryService.checkManner(keyword);
  }

  @ApiOperation({ summary: '입력한 단어로시작하는 단어' })
  @Get('all/:id')
  async findAll(@Param('id') id: string) {
    return await this.dictionaryService.findAll(id);
  }
}
