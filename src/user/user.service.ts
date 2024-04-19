import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  async findById(id: string) {
    const response = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        score: true,
        roomId: true,
        password: true,
      },
    });
    return response;
  }
  async roomCreate(id: string, roomId: string) {
    const response = await this.prisma.user.update({
      where: { id },
      data: {
        room: { connect: { id: roomId } },
      },
      include: {
        room: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return response.room;
  }
  async enter(id: string, roomId: string) {
    const response = await this.prisma.user.update({
      where: { id },
      data: {
        room: { connect: { id: roomId } },
      },
      include: {
        room: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return response.room;
  }

  async exit(id: string) {
    const response = await this.prisma.user.update({
      where: { id },
      data: {
        room: { disconnect: true },
      },
      include: {
        room: true,
      },
    });
    return response.room;
  }
}
