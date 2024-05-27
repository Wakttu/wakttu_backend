import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMemeDto } from './dto/create-meme.dto';
import { UpdateMemeDto } from './dto/update-meme.dto';

@Injectable()
export class MemeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMemeDto) {
    return await this.prisma.wakttu_meme.create({ data });
  }

  async findById(id: string) {
    return await this.prisma.wakttu_meme.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateMemeDto) {
    return await this.prisma.wakttu_meme.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return await this.prisma.wakttu_meme.delete({ where: { id } });
  }

  async getWord() {
    const data = await this.prisma.wakttu_meme.findMany();
    const length = data.length;
    const take = Math.floor(Math.random() * length);
    return data[take];
  }
}
