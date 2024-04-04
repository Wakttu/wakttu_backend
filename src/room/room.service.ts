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
        option: true,
        count: true,
        start: true,
        masterId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByQuery(
    title: string = undefined,
    start: boolean = false,
    option: boolean[] = undefined,
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
        option: true,
        count: true,
        start: true,
        masterId: true,
        createdAt: true,
        updatedAt: true,
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
        option: true,
        count: true,
        start: true,
        masterId: true,
        createdAt: true,
        updatedAt: true,
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
        option: true,
        count: true,
        start: true,
        masterId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string): Promise<any> {
    return await this.prisma.room.delete({ where: { id } });
  }
}
