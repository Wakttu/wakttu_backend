import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateRoomDto): Promise<Room | null> {
    return await this.prisma.room.create({
      data,
      select: {
        id: true,
        title: true,
        type: true,
        round: true,
        option: true,
        total: true,
        start: true,
        createdAt: true,
        updatedAt: true,
        users: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findByQuery(
    title: string = undefined,
    start: boolean = false,
    option: string[] = [],
    take: number = 6,
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
      select: {
        id: true,
        title: true,
        type: true,
        round: true,
        option: true,
        total: true,
        start: true,
        createdAt: true,
        updatedAt: true,
        users: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findById(id: string): Promise<Room | null> {
    return await this.prisma.room.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        type: true,
        round: true,
        option: true,
        total: true,
        start: true,
        createdAt: true,
        updatedAt: true,
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
      select: {
        id: true,
        title: true,
        type: true,
        round: true,
        option: true,
        total: true,
        start: true,
        createdAt: true,
        updatedAt: true,
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
      select: {
        id: true,
        title: true,
        type: true,
        round: true,
        option: true,
        total: true,
        start: true,
        createdAt: true,
        updatedAt: true,
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
}
