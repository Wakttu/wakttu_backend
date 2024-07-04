import {
  Get,
  Post,
  Body,
  Controller,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './user.guard';
import { IsLoginedGuard } from 'src/auth/isLogined-auth.guard';
import { IsNotLoginedGuard } from 'src/auth/isNotLogined-auth.guard';
import { ScoreUserDto } from './dto/score-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get User Info by id' })
  @ApiParam({
    name: 'id',
    type: 'string',
  })
  @UseGuards(IsLoginedGuard, AuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @ApiOperation({ summary: 'SignUp User' })
  @ApiBody({
    description: 'signup User',
    type: CreateUserDto,
  })
  @UseGuards(IsNotLoginedGuard)
  @Post()
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Update User' })
  @ApiParam({
    name: 'id',
    type: 'string',
  })
  @ApiBody({
    description: 'update User',
    type: UpdateUserDto,
  })
  @UseGuards(IsLoginedGuard, AuthGuard)
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return await this.userService.update(id, body);
  }
  @ApiOperation({ summary: 'Update Score' })
  @ApiParam({
    name: 'id',
    type: 'string',
  })
  @ApiBody({
    description: 'update score',
    type: ScoreUserDto,
  })
  @UseGuards(IsLoginedGuard, AuthGuard)
  @Patch(':id')
  async updateScore(@Param('id') id: string, @Body('score') score: number) {
    return await this.userService.updateScore(id, score);
  }
}
