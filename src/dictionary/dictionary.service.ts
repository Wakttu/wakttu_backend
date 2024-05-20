import { Injectable } from '@nestjs/common';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DictionaryService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateDictionaryDto) {
    return await this.prisma.wakttu_ko.create({ data });
  }

  async findById(id: string) {
    return await this.prisma.wakttu_ko.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateDictionaryDto) {
    return await this.prisma.wakttu_ko.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return await this.prisma.wakttu_ko.delete({ where: { id } });
  }

  async getWord(length: number) {
    const list: string[] = await this.prisma
      .$queryRaw`SELECT * FROM "public"."wakttu_ko" WHERE LENGTH(_id) =${length} LIMIT 10000`;
    let idx;
    if (list.length < 10000) {
      idx = Math.floor(Math.random() * list.length);
    } else {
      idx = Math.floor(Math.random() * 10000);
    }
    return list[idx];
  }

  async checkManner(keyword: string) {
    return await this.prisma.wakttu_ko.findMany({
      where: { id: { startsWith: keyword } },
      take: 10,
    });
  }
}
