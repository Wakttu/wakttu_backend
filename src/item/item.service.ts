import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ItemService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.item.findMany({
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      throw new Error(`아이템 조회 중 오류가 발생했습니다: ${error.message}`);
    }
  }
}
