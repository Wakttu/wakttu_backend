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
      const check = await this.prisma.achievements.findUnique({
        where: { id_userId: { id, userId } },
      });
      if (check) return null;
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

  async setJogong(userId: string) {
    const statsArray = {
      'WOO-1': 98,
      'WOO-2': 9,
      'INE-1': 98,
      'INE-2': 19,
      'JING-1': 98,
      'JING-2': 19,
      'LIL-1': 98,
      'LIL-2': 4,
      'JU-1': 98,
      'JU-2': 4,
      'GO-1': 98,
      'GO-2': 19,
      'VIi-1': 98,
      'VIi-2': 19,
      'GOMEM-1': 48,
      'GOMEM-2': 48,
      EXIT: 9,
      FILTER: 9,
    };

    for (const [statId, incrementValue] of Object.entries(statsArray)) {
      try {
        await this.putStat(userId, statId, incrementValue);
      } catch (error) {
        console.error(
          `통계 업데이트 실패 (statId: ${statId}): ${error.message}`,
        );
      }
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
            id: 'MOT',
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
            id: 'PEACH',
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
    [
      'WOO',
      (word) => [
        'WOO-1',
        ...(word.id === '신세계의신이되는거다' ? ['WOO-2'] : []),
      ],
    ],
    ['INE', (word) => ['INE-1', ...(word.id === '오야' ? ['INE-2'] : [])]],
    [
      'JINGBURGER',
      (word) => [
        'JING-1',
        ...(word.meta?.tag.includes('어록') ? ['JING-2'] : []),
      ],
    ],
    ['LILPA', (word) => ['LIL-1', ...(word.id === '띨파' ? ['LIL-2'] : [])]],
    [
      'JURURU',
      (word) => [
        'JU-1',
        ...(word.id === '주폭도' || word.id === '주스단' || word.id === '려우'
          ? ['JU-2']
          : []),
      ],
    ],
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

  async getRanks() {
    try {
      const results = await this.prisma.$transaction([
        this.prisma.user.findMany({
          where: { provider: { notIn: ['manager', 'staff'] } },
          orderBy: { score: 'desc' },
          take: 7,
          select: {
            name: true,
            score: true,
          },
        }),
        this.prisma.stats.findMany({
          where: {
            id: 'WOO-1',
            user: { provider: { notIn: ['manager', 'staff'] } },
          },
          orderBy: { value: 'desc' },
          take: 7,
          select: {
            user: { select: { name: true, score: true } },
            value: true,
          },
        }),
        this.prisma.stats.findMany({
          where: {
            id: 'INE-1',
            user: { provider: { notIn: ['manager', 'staff'] } },
          },
          orderBy: { value: 'desc' },
          take: 7,
          select: {
            user: { select: { name: true, score: true } },
            value: true,
          },
        }),
        this.prisma.stats.findMany({
          where: {
            id: 'JING-1',
            user: { provider: { notIn: ['manager', 'staff'] } },
          },
          orderBy: { value: 'desc' },
          take: 7,
          select: {
            user: { select: { name: true, score: true } },
            value: true,
          },
        }),
        this.prisma.stats.findMany({
          where: {
            id: 'LIL-1',
            user: { provider: { notIn: ['manager', 'staff'] } },
          },
          orderBy: { value: 'desc' },
          take: 7,
          select: {
            user: { select: { name: true, score: true } },
            value: true,
          },
        }),
        this.prisma.stats.findMany({
          where: {
            id: 'JU-1',
            user: { provider: { notIn: ['manager', 'staff'] } },
          },
          orderBy: { value: 'desc' },
          take: 7,
          select: {
            user: { select: { name: true, score: true } },
            value: true,
          },
        }),
        this.prisma.stats.findMany({
          where: {
            id: 'GO-1',
            user: { provider: { notIn: ['manager', 'staff'] } },
          },
          orderBy: { value: 'desc' },
          take: 7,
          select: {
            user: { select: { name: true, score: true } },
            value: true,
          },
        }),
        this.prisma.stats.findMany({
          where: {
            id: 'VIi-1',
            user: { provider: { notIn: ['manager', 'staff'] } },
          },
          orderBy: { value: 'desc' },
          take: 7,
          select: {
            user: { select: { name: true, score: true } },
            value: true,
          },
        }),
      ]);

      return {
        userRanks: results[0].map((item) => {
          return { user: item };
        }),
        wooRanks: results[1],
        ineRanks: results[2],
        jingRanks: results[3],
        lilRanks: results[4],
        juRanks: results[5],
        goRanks: results[6],
        viRanks: results[7],
      };
    } catch (error) {
      throw new Error(`랭킹 확인 중 오류 발생: ${error.message}`);
    }
  }
}
