import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MemeService } from './meme.service';
import { CreateMemeDto } from './dto/create-meme.dto';
import { UpdateMemeDto } from './dto/update-meme.dto';

@ApiTags('Meme')
@Controller('meme')
export class MemeController {
  constructor(private readonly memeService: MemeService) {}
  @ApiOperation({ summary: '밈 추가' })
  @Post()
  async create(@Body() createMemeDto: CreateMemeDto) {
    return await this.memeService.create(createMemeDto);
  }

  @ApiOperation({ summary: '밈 검색' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.memeService.findById(id);
  }

  @ApiOperation({ summary: '밈 수정' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateMemeDto: UpdateMemeDto) {
    return await this.memeService.update(id, updateMemeDto);
  }

  @ApiOperation({ summary: '밈 삭제' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.memeService.remove(id);
  }
}
