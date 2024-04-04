import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import {
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { QueryRoomDto } from './dto/query-room.dto';

@ApiTags('Room')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @ApiOperation({ summary: 'Room 생성' })
  @ApiBody({
    description: 'signup User',
    type: CreateRoomDto,
  })
  @Post()
  async create(@Body() createRoomDto: CreateRoomDto) {
    return await this.roomService.create(createRoomDto);
  }

  @ApiOperation({
    summary: 'room 정보 얻기',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
  })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.roomService.findById(id);
  }

  @ApiOperation({ summary: '방 설정 수정' })
  @ApiParam({
    name: 'id',
    type: 'string',
  })
  @ApiBody({
    description: 'room 수정',
    type: UpdateRoomDto,
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return await this.roomService.update(id, updateRoomDto);
  }

  @ApiOperation({ summary: '방 삭제' })
  @ApiParam({
    name: 'id',
    type: 'string',
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.roomService.remove(id);
  }

  @ApiOperation({ summary: '방정보 query로 검색' })
  @ApiQuery({
    description: 'query를 통해 검색',
    type: QueryRoomDto,
  })
  @Get('query')
  findByQuery(@Query() query: any) {
    const { title, start, option, take, skip } = query;
    return this.roomService.findByQuery(title, start, option, take, skip);
  }
}
