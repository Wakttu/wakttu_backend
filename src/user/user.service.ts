import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { WakgamesService } from 'src/wakgames/wakgames.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wakgamesService: WakgamesService,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    const response = await this.prisma.user.create({ data });
    await this.prisma.userGetItem.create({
      data: {
        userId: response.id,
        itemId: 'S-1',
      },
    });
    return response;
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data,
      omit: {
        password: true,
      },
    });
  }

  async findById(id: string) {
    const response = await this.prisma.user.findUnique({
      where: { id },
    });
    return response;
  }

  async findByName(name: string) {
    const response = await this.prisma.user.findFirst({
      where: { name },
      omit: {
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
                character: true,
                score: true,
                keyboard: true,
                provider: true,
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
                character: true,
                score: true,
                keyboard: true,
                provider: true,
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

  async getKeyboard(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: { keyboard: true, emoji: true },
    });
  }

  async updateScore(id: string, score: number) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        score: { increment: score },
      },
      select: {
        score: true,
      },
    });
  }

  async updateResult(
    data: {
      id: string;
      score: number;
      userId: string;
      character: JSON;
      name: string;
    }[],
  ) {
    const result = {};
    await Promise.all(
      data.map(async (user) => {
        result[user.id] = (
          await this.updateScore(user.userId, user.score)
        ).score;
      }),
    );
    return result;
  }

  async getItems(id: string) {
    return this.prisma.item.findMany({
      where: {
        user: {
          some: {
            userId: id,
          },
        },
      },
    });
  }

  async achieveItem(userId: string, itemId: string) {
    const data = await this.prisma.userGetItem.count({
      where: {
        userId,
        itemId,
      },
    });
    if (data > 0)
      return { success: false, message: '이미 보유한 아이템 입니다!' };

    const res = await this.prisma.userGetItem.create({
      data: {
        userId,
        itemId,
      },
    });
    if (!res) return { success: false, message: '알 수 없는 이유로 실패' };

    return { success: true, message: '획득 성공!' };
  }
}
