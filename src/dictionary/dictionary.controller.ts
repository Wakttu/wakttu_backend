import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { SocketGateway } from 'src/socket/socket.gateway';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Dictionary')
@Controller('dictionary')
export class DictionaryController {
  constructor(
    private readonly dictionaryService: DictionaryService,
    private readonly socketGateway: SocketGateway,
  ) {}

  @ApiOperation({ summary: '사전 단어 추가' })
  @Post()
  async create(@Body() createDictionaryDto: CreateDictionaryDto) {
    return await this.dictionaryService.create(createDictionaryDto);
  }

  @ApiOperation({ summary: '단어 추가 검색' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.dictionaryService.findById(id);
  }

  @ApiOperation({ summary: '사전 단어 수정' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDictionaryDto: UpdateDictionaryDto,
  ) {
    return await this.dictionaryService.update(id, updateDictionaryDto);
  }

  @ApiOperation({ summary: '사전 단어 삭제' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.dictionaryService.remove(id);
  }

  @ApiOperation({ summary: 'socket통신' })
  @Get('game/:id')
  async check(@Param('id') id: string, @Req() req: any) {
    const server = this.socketGateway.server;
    const response = await this.dictionaryService.findById(id);
    console.log(req.user);
    if (!response) {
      server.emit('game', '존재하지않음');
    } else {
      server.emit('game', response);
    }
    return response;
  }
}
