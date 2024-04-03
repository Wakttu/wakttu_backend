import { Injectable } from '@nestjs/common';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DictionaryService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateDictionaryDto) {
    return await this.prisma.kkutu_ko.create({ data });
  }

  async findById(id: string) {
    return await this.prisma.kkutu_ko.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateDictionaryDto) {
    return await this.prisma.kkutu_ko.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return await this.prisma.kkutu_ko.delete({ where: { id } });
  }
}
