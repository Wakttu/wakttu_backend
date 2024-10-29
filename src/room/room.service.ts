import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoom, Room } from './entities/room.entity';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRoomDto): Promise<CreateRoom> {
    try {
      return this.prisma.room.create({
        data,
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
      });
    } catch (error) {
      throw new BadRequestException('방 생성에 실패했습니다.');
    }
  }

  async findByQuery(
    title: string = undefined,
    start: boolean = undefined,
    option: string[] = [],
    take: number = undefined,
    skip: number = 0,
  ): Promise<Room[] | null> {
    return await this.prisma.room.findMany({
      take,
      skip,
      where: {
        title: { contains: title },
        start,
        option: { hasEvery: option },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(): Promise<Room[] | null> {
    return await this.prisma.room.findMany({
      include: {
        users: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findById(id: string): Promise<Room> {
    try {
      const room = await this.prisma.room.findUnique({
        where: { id },
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
      });

      if (!room) {
        throw new NotFoundException(`ID ${id}인 방을 찾을 수 없습니다.`);
      }

      return room;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('방을 찾는 중 오류가 발생했습니다.');
    }
  }

  async update(id: string, data: UpdateRoomDto): Promise<Room> {
    try {
      return this.prisma.room.update({
        where: { id },
        data,
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
      });
    } catch (error) {
      throw new BadRequestException(`ID ${id}인 방 업데이트에 실패했습니다.`);
    }
  }

  async setStart(id: string, start: boolean): Promise<Room> {
    return await this.prisma.room.update({
      where: { id },
      data: {
        start: {
          set: start,
        },
      },
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
    });
  }
  async remove(id: string): Promise<any> {
    return await this.prisma.room.deleteMany({ where: { id } });
  }

  async removeAll(): Promise<any> {
    return await this.prisma.room.deleteMany();
  }

  async checkPassword(
    roomId: string,
    password: string | undefined,
  ): Promise<boolean> {
    try {
      const room = await this.prisma.room.findUnique({
        where: { id: roomId, password },
      });
      return !!room;
    } catch (error) {
      throw new BadRequestException('비밀번호 확인 중 오류가 발생했습니다.');
    }
  }
}
