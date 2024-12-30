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
    try {
      const response = await this.prisma.user.create({ data });
      await this.prisma.userGetItem.create({
        data: {
          userId: response.id,
          itemId: 'S-1',
        },
      });
      return response;
    } catch (error) {
      throw new Error(`사용자 생성 실패: ${error.message}`);
    }
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

  private readonly userSelectFields = {
    id: true,
    name: true,
    character: true,
    score: true,
    keyboard: true,
    provider: true,
  };

  async roomCreate(id: string, roomId: string) {
    try {
      const response = await this.prisma.user.update({
        where: { id },
        data: {
          room: { connect: { id: roomId } },
        },
        include: {
          room: {
            include: {
              users: {
                select: this.userSelectFields,
              },
            },
          },
        },
      });
      return response.room;
    } catch (error) {
      throw new Error(`방 생성 실패: ${error.message}`);
    }
  }

  async enter(id: string, roomId: string) {
    try {
      const room = await this.prisma.room.findUnique({
        where: { id: roomId },
        select: { start: true },
      });
      if (room.start) {
        throw new Error('이미 시작된 방입니다.');
      }
      const response = await this.prisma.user.update({
        where: { id },
        data: {
          room: { connect: { id: roomId } },
        },
        include: {
          room: {
            include: {
              users: {
                select: this.userSelectFields,
              },
            },
          },
        },
      });
      return response.room;
    } catch (error) {
      throw new Error(`방 입장 실패: ${error.message}`);
    }
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
    try {
      const result = {};
      await Promise.all(
        data.map(async (user) => {
          const updatedScore = await this.updateScore(
            user.userId,
            Math.ceil(user.score / 5),
          );
          result[user.id] = updatedScore.score;
        }),
      );
      return result;
    } catch (error) {
      throw new Error(`결과 업데이트 실패: ${error.message}`);
    }
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
    try {
      const existingItem = await this.prisma.userGetItem.count({
        where: { userId, itemId },
      });

      if (existingItem > 0) {
        return { success: false, message: '이미 보유한 아이템 입니다!' };
      }

      const newItem = await this.prisma.userGetItem.create({
        data: { userId, itemId },
      });

      return newItem
        ? { success: true, message: '획득 성공!' }
        : { success: false, message: '알 수 없는 이유로 실패' };
    } catch (error) {
      throw new Error(`아이템 획득 실패: ${error.message}`);
    }
  }

  async achieveAllItems(userId: string) {
    try {
      const allItems = await this.prisma.item.findMany({
        select: { id: true },
      });

      const userItems = await this.prisma.userGetItem.findMany({
        where: { userId },
        select: { itemId: true },
      });

      const userItemIds = userItems.map((item) => item.itemId);

      const itemsToAdd = allItems.filter(
        (item) => !userItemIds.includes(item.id),
      );

      const result = await this.prisma.userGetItem.createMany({
        data: itemsToAdd.map((item) => ({
          userId,
          itemId: item.id,
        })),
      });

      return {
        success: true,
        message: `${result.count}개의 새로운 아이템을 획득했습니다!`,
      };
    } catch (error) {
      throw new Error(`전체 아이템 획득 실패: ${error.message}`);
    }
  }

  async deleteGuest(id: string) {
    try {
      return this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new Error(`게스트 삭제 실패: ${error.message}`);
    }
  }
}
