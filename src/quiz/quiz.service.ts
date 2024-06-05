import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quize.dto';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateQuizDto) {
    return await this.prisma.wakttu_quiz.create({ data });
  }

  async findById(id: number) {
    return await this.prisma.wakttu_quiz.findUnique({
      where: { id },
    });
  }
  async findByTag(tag: string) {
    return await this.prisma.wakttu_quiz.findMany({
      where: {
        tag: {
          has: tag,
        },
      },
    });
  }
  async update(id: number, data: UpdateQuizDto) {
    return await this.prisma.wakttu_quiz.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return await this.prisma.wakttu_quiz.delete({ where: { id } });
  }

  async getList(take: number) {
    return await this.prisma
      .$queryRaw`SELECT * From "public"."wakttu_quiz" ORDER BY random() LIMIT ${take}`;
  }
}
