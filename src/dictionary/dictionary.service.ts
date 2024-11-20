import { Injectable } from '@nestjs/common';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DictionaryService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateDictionaryDto) {
    return await this.prisma.dictionary.create({ data });
  }

  async findById(id: string) {
    return await this.prisma.dictionary.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateDictionaryDto) {
    return await this.prisma.dictionary.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return await this.prisma.dictionary.delete({ where: { id } });
  }

  async getWord(length: number): Promise<string> {
    const list: string[] = await this.prisma
      .$queryRaw`SELECT * FROM "public"."wakttu_ko" WHERE LENGTH(_id) =${length} ORDER BY random() LIMIT 1`;
    return list[0];
  }

  async checkManner(keyword: string): Promise<boolean> {
    const res = await this.prisma.manner.findUnique({
      where: { id: keyword },
    });
    if (res) return true;
    return false;
  }

  async getMission(): Promise<string> {
    const list: string[] = await this.prisma
      .$queryRaw`SELECT _id FROM "public"."wakttu_manner" ORDER BY random() LIMIT 1`;
    return list[0]['_id'];
  }
}
