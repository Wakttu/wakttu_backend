import { Injectable } from '@nestjs/common';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DictionaryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDictionaryDto) {
    try {
      return await this.prisma.dictionary.create({ data });
    } catch (error) {
      throw new Error(`단어 생성 중 오류 발생: ${error.message}`);
    }
  }

  async findById(id: string) {
    try {
      return await this.prisma.dictionary.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`단어 검색 중 오류 발생: ${error.message}`);
    }
  }

  async findAll(id: string) {
    return await this.prisma.dictionary.findMany({
      where: {
        id: { startsWith: id },
      },
      take: 10,
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

  async getWord(length: number): Promise<any> {
    try {
      const list: string[] = await this.prisma
        .$queryRaw`SELECT _id FROM "public"."wakttu_ko" WHERE LENGTH(_id) = ${length} AND wakta = true ORDER BY random() LIMIT 1`;

      const word = list[0]['_id'];

      for (const char of word.split('')) {
        const isSafe = await this.checkManner(char);
        if (!isSafe) {
          return {
            _id: '우리모두품어놀자'.slice(0, length),
            mean: '더미',
            type: '더미',
            meta: { url: null },
            hit: 0,
          };
        }
      }

      return list[0];
    } catch (error) {
      throw new Error(`단어 가져오기 중 오류 발생: ${error.message}`);
    }
  }

  async checkManner(keyword: string): Promise<boolean> {
    try {
      const res = await this.prisma.manner.findUnique({
        where: { id: keyword },
      });
      return !!res;
    } catch (error) {
      throw new Error(`매너 검사 중 오류 발생: ${error.message}`);
    }
  }

  async getMission(): Promise<string> {
    const list: string[] = await this.prisma
      .$queryRaw`SELECT _id FROM "public"."wakttu_mission" ORDER BY random() LIMIT 1`;
    return list[0]['_id'];
  }

  async search(keyword: string, take: number = 20, skip: number = 0) {
    return await this.prisma.dictionary.findMany({
      where: {
        id: { startsWith: keyword },
      },
      take: take,
      skip: skip,
      orderBy: { wakta: 'desc' },
    });
  }

  async todayWord(): Promise<string> {
    const list: string[] = await this.prisma
      .$queryRaw`SELECT * FROM "public"."wakttu_ko" WHERE wakta = true ORDER BY random() LIMIT 1`;
    return list[0];
  }

  async getQuiz(round: number) {
    const list: [] = await this.prisma
      .$queryRaw`SELECT * FROM "public"."wakttu_quiz" WHERE LENGTH(_id) BETWEEN 3 AND 10 ORDER BY random() LIMIT ${round}`;
    return list;
  }
}
