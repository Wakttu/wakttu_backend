import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAchieve(userId: string) {
    const achieves = await this.prisma.achievements.findMany({
      where: { userId },
    });
    return { achieves };
  }

  async createAchieve(id: string, userId: string) {
    return await this.prisma.achievements.create({
      data: {
        id,
        userId,
      },
    });
  }

  async putResult(body: [], user: any) {
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
  }

  async putStat(userId: string, statId: string, incrementValue: number) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. 통계가 존재하는지 확인 (statId로 조회)
      let currentStat = await tx.stats.findUnique({
        where: { id_userId: { id: statId, userId } },
      });

      // 2. 통계가 없다면 생성
      if (!currentStat) {
        currentStat = await tx.stats.create({
          data: {
            id: statId, // 새 통계 ID
            userId, // 유저 ID
            value: 0, // 기본 통계 값 (초기 값은 0)
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
  }

  // 통계 ID로 업적 확인
  async checkAchievementsByStatId(
    tx: any,
    userId: string,
    statId: string,
    newValue: number,
  ) {
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
  }

  getId(word: { type: string; id: string; [x: string]: any }) {
    const id = [];
    switch (word.type) {
      case 'WOO': {
        id.push('WOO-1');
        break;
      }
      case 'INE': {
        id.push('INE-1');
        this.getINE(id, word);
        break;
      }
      case 'JINGBURGER': {
        id.push('JING-1');
        this.getJING(id, word);
        break;
      }
      case 'LILPA': {
        id.push('LIL-1');
        this.getLIL(id, word);
        break;
      }
      case 'JURURU': {
        id.push('JU-1');
        this.getJU(id, word);
        break;
      }
      case 'GOSEGU': {
        id.push('GO-1');
        this.getGO(id, word);
        break;
      }
      case 'VIICHAN': {
        id.push('VIi-1');
        this.getVIi(id, word);
        break;
      }
      case 'GOMEM': {
        this.getGomem(id, word);
        break;
      }
    }
    return id;
  }

  getINE(id: string[], word: { id: string; [x: string]: any }) {
    if (word.id === '오야') id.push('INE-2');
  }

  getJING(id: string[], word: { id: string; [x: string]: any }) {
    if (word.meta.tag.includes('어록')) id.push('JING-2');
  }

  getLIL(id: string[], word: { id: string; [x: string]: any }) {
    if (word.id === '띨파') id.push('LIL-2');
  }

  getJU(id: string[], word: { id: string; [x: string]: any }) {
    if (word.id === '띨르르') id.push('JU-2');
  }

  getGO(id: string[], word: { id: string; [x: string]: any }) {
    if (word.meta.tag.includes('콘텐츠')) id.push('GO-2');
  }

  getVIi(id: string[], word: { id: string; [x: string]: any }) {
    if (word.id.includes('복숭아')) id.push('VIi-2');
  }

  getGomem(id: string[], word: { id: string; [x: string]: any }) {
    if (word.meta.tag.includes('고멤')) id.push('GOM-1');
    if (word.meta.tag.includes('아카데미')) id.push('GOM-2');
  }
}
