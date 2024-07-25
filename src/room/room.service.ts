import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoom, Room } from './entities/room.entity';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateRoomDto): Promise<CreateRoom | null> {
    return await this.prisma.room.create({
      data,
      include: {
        users: {
          select: { id: true, name: true },
        },
      },
    });
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
          select: { id: true, name: true },
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

  async findById(id: string): Promise<Room | null> {
    return await this.prisma.room.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateRoomDto): Promise<Room | null> {
    return await this.prisma.room.update({
      where: { id },
      data,
      include: {
        users: {
          select: { id: true, name: true },
        },
      },
    });
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
          select: { id: true, name: true },
        },
      },
    });
  }
  async remove(id: string): Promise<any> {
    return await this.prisma.room.delete({ where: { id } });
  }

  async removeAll(): Promise<any> {
    return await this.prisma.room.deleteMany();
  }

  async checkPassword(
    roomId: string,
    password: string | undefined,
  ): Promise<boolean> {
    const response = await this.prisma.room.findUnique({
      where: { id: roomId, password: password },
    });
    if (response) return true;
    return false;
  }
}
