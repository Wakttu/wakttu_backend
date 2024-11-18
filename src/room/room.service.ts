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
  constructor(private readonly prisma: PrismaService) {
    this.idx = 0;
  }
  public idx;

  async create(data: CreateRoomDto): Promise<CreateRoom> {
    try {
      const _data = { ...data, idx: this.idx++ };
      this.idx %= 1000;
      return this.prisma.room.create({
        data: _data,
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
    try {
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
    } catch (error) {
      throw new BadRequestException('방 검색 중 오류가 발생했습니다.');
    }
  }

  async findAll(): Promise<Room[] | null> {
    try {
      return await this.prisma.room.findMany({
        include: {
          users: {
            select: { id: true, name: true },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        '방 목록을 가져오는 중 오류가 발생했습니다.',
      );
    }
  }

  async findById(id: string): Promise<Room> {
    try {
      return await this.prisma.room.findUnique({
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
    try {
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
    } catch (error) {
      throw new BadRequestException(
        `게임 시작 상태 변경 중 오류가 발생했습니다.`,
      );
    }
  }

  async remove(id: string): Promise<any> {
    try {
      return await this.prisma.room.deleteMany({ where: { id } });
    } catch (error) {
      throw new BadRequestException(`방 삭제 중 오류가 발생했습니다.`);
    }
  }

  async removeAll(): Promise<any> {
    try {
      return await this.prisma.room.deleteMany();
    } catch (error) {
      throw new BadRequestException('전체 방 삭제 중 오류가 발생했습니다.');
    }
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
