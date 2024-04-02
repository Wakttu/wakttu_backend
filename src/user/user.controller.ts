import { Get, Post, Body, Controller, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get User Info by id' })
  @ApiParam({
    name: 'id',
    type: 'string',
  })
  @Get(':id')
  async getUser(@Param() id: string) {
    return await this.userService.findById(id);
  }

  @ApiOperation({ summary: 'SignUp User' })
  @ApiBody({
    description: 'signup User',
    type: CreateUserDto,
  })
  @Post()
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }
}
