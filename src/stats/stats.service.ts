import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAchieve(userId: string) {
    try {
      const achieves = await this.prisma.achievements.findMany({
        where: { userId },
      });
      return { achieves };
    } catch (error) {
      throw new Error(`업적 조회 중 오류 발생: ${error.message}`);
    }
  }

  async createAchieve(id: string, userId: string) {
    try {
      return await this.prisma.achievements.create({
        data: {
          id,
          userId,
        },
      });
    } catch (error) {
      throw new Error(`업적 생성 중 오류 발생: ${error.message}`);
    }
  }

  async putResult(body: [], user: any) {
    try {
      const map = new Map<string, number>();

      body.forEach((item: { type: string; [x: string]: any }) => {
        if (item.type !== 'WORD') return;

        const statId = this.getId(item.word);
        if (statId.length === 0) return;

        statId.forEach((id) => {
          const count = map.get(id);
          map.set(id, count ? count + 1 : 1);
        });
      });

      const _stats = [];
      let _achieves = [];
      for (const key of map.keys()) {
        const { stats, achieves } = await this.putStat(
          user.id,
          key,
          map.get(key),
        );
        _stats.push(stats);
        _achieves = [..._achieves, ...achieves];
      }
      return { stats: _stats, achieves: _achieves };
    } catch (error) {
      throw new Error(`결과 처리 중 오류 발생: ${error.message}`);
    }
  }

  async putStat(userId: string, statId: string, incrementValue: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        let currentStat = await tx.stats.findUnique({
          where: { id_userId: { id: statId, userId } },
        });

        if (!currentStat) {
          currentStat = await tx.stats.create({
            data: {
              id: statId,
              userId,
              value: 0,
            },
          });
        }

        // 3. 기존 값에 새로운 값 더하기
        const newStatValue = currentStat.value + incrementValue;

        // 4. 통계 값 업데이트
        const updatedStat = await tx.stats.update({
          where: { id_userId: { id: statId, userId } },
          data: { value: newStatValue },
        });

        // 5. 업데이트된 통계 값을 기반으로 업적 확인
        const createAchieve = await this.checkAchievementsByStatId(
          tx,
          userId,
          statId,
          updatedStat.value,
        );

        return { stats: updatedStat, achieves: createAchieve };
      });
    } catch (error) {
      throw new Error(`통계 업데이트 중 오류 발생: ${error.message}`);
    }
  }

  // 통계 ID로 업적 확인
  async checkAchievementsByStatId(
    tx: any,
    userId: string,
    statId: string,
    newValue: number,
  ) {
    try {
      const achievementConditions = {
        LAST_COUNT: [
          {
            threshold: 1,
            id: 'WELCOME',
          },
        ],
        'WOO-1': [
          {
            threshold: 100,
            id: 'ITSME',
          },
        ],
        'WOO-2': [
          {
            threshold: 10,
            id: 'HAA',
          },
        ],
        'INE-1': [
          {
            threshold: 100,
            id: 'DULGI',
          },
        ],
        'INE-2': [
          {
            threshold: 20,
            id: 'OYA',
          },
        ],
        'JING-1': [
          {
            threshold: 100,
            id: 'GANGAJI',
          },
          {
            threshold: 1,
            id: 'test_achieve_2',
          },
        ],
        'JING-2': [
          {
            threshold: 20,
            id: 'MOSIGGANG',
          },
        ],
        'LIL-1': [
          {
            threshold: 10,
            id: 'BABYBAT',
          },
          {
            threshold: 1,
            id: 'test_achieve_3',
          },
          {
            threshold: 100,
            id: 'BAT',
          },
        ],
        'LIL-2': [
          {
            threshold: 5,
            id: 'DERPPA',
          },
        ],
        'JU-1': [
          {
            threshold: 100,
            id: 'POKDO',
          },
        ],
        'JU-2': [
          {
            threshold: 5,
            id: 'DERPJU',
          },
        ],
        'GO-1': [
          {
            threshold: 100,
            id: 'SEGYUN',
          },
        ],
        'GO-2': [
          {
            threshold: 20,
            id: 'YEOLSIM',
          },
        ],
        'VIi-1': [
          {
            threshold: 100,
            id: 'RANI',
          },
        ],
        'VIi-2': [
          {
            threshold: 20,
            id: 'RANI',
          },
        ],
        'GOMEM-1': [
          {
            threshold: 50,
            id: 'GOMEM',
          },
        ],
        'GOMEM-2': [
          {
            threshold: 50,
            id: 'ACADEMY',
          },
        ],
        WINSOL: [
          {
            threshold: 100,
            id: 'IMSOLO',
          },
        ],
        WINTEAM: [
          {
            threshold: 100,
            id: 'MYTEAM',
          },
        ],
        EXIT: [
          {
            threshold: 10,
            id: 'ESCAPE',
          },
        ],
        FILTER: [
          {
            threshold: 10,
            id: 'MAID',
          },
        ],
        // 더 많은 통계 ID와 업적 조건을 추가 가능
      };

      const conditions = achievementConditions[statId] || [];

      const achieve = [];
      for (const condition of conditions) {
        if (newValue >= condition.threshold) {
          const achievementExists = await tx.achievements.findFirst({
            where: {
              id: condition.id,
              userId,
            },
          });

          if (!achievementExists) {
            const res = await tx.achievements.create({
              data: {
                id: condition.id,
                userId,
              },
            });
            if (res) achieve.push(res);
          }
        }
      }
      return achieve;
    } catch (error) {
      throw new Error(`업적 확인 중 오류 발생: ${error.message}`);
    }
  }

  private readonly typeHandlers = new Map<
    string,
    (word: {
      type: string;
      id: string;
      meta?: { tag: string[] };
      [x: string]: any;
    }) => string[]
  >([
    ['WOO', () => ['WOO-1']],
    ['INE', (word) => ['INE-1', ...(word.id === '오야' ? ['INE-2'] : [])]],
    [
      'JINGBURGER',
      (word) => [
        'JING-1',
        ...(word.meta?.tag.includes('어록') ? ['JING-2'] : []),
      ],
    ],
    ['LILPA', (word) => ['LIL-1', ...(word.id === '띨파' ? ['LIL-2'] : [])]],
    ['JURURU', (word) => ['JU-1', ...(word.id === '띨르르' ? ['JU-2'] : [])]],
    [
      'GOSEGU',
      (word) => [
        'GO-1',
        ...(word.meta?.tag.includes('콘텐츠') ? ['GO-2'] : []),
      ],
    ],
    [
      'VIICHAN',
      (word) => ['VIi-1', ...(word.id.includes('복숭아') ? ['VIi-2'] : [])],
    ],
    [
      'GOMEM',
      (word) => [
        ...(word.meta?.tag.includes('고멤') ? ['GOM-1'] : []),
        ...(word.meta?.tag.includes('아카데미') ? ['GOM-2'] : []),
      ],
    ],
  ]);

  getId(word: {
    type: string;
    id: string;
    meta?: { tag: string[] };
    [x: string]: any;
  }): string[] {
    const handler = this.typeHandlers.get(word.type);
    return handler ? handler(word) : [];
  }
}
