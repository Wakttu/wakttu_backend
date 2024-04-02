'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.UserService = void 0;
const common_1 = require('@nestjs/common');
const prisma_service_1 = require('../prisma/prisma.service');
const wakgames_service_1 = require('../wakgames/wakgames.service');
let UserService = class UserService {
  constructor(prisma, wakgamesService) {
    this.prisma = prisma;
    this.wakgamesService = wakgamesService;
    this.userSelectFields = {
      id: true,
      name: true,
      character: true,
      score: true,
      keyboard: true,
      provider: true,
    };
  }
  async create(data) {
    try {
      const response = await this.prisma.user.create({ data });
      await this.prisma.userGetItem.create({
        data: {
          userId: response.id,
          itemId: 'S-1',
        },
      });
      return response;
    } catch (error) {
      throw new Error(`사용자 생성 실패: ${error.message}`);
    }
  }
  async update(id, data) {
    return await this.prisma.user.update({
      where: { id },
      data,
      omit: {
        password: true,
      },
    });
  }
  async findById(id) {
    const response = await this.prisma.user.findUnique({
      where: { id },
    });
    return response;
  }
  async findByName(name) {
    const response = await this.prisma.user.findFirst({
      where: { name },
      omit: {
        password: true,
      },
    });
    return response;
  }
  async roomCreate(id, roomId) {
    try {
      const response = await this.prisma.user.update({
        where: { id },
        data: {
          room: { connect: { id: roomId } },
        },
        include: {
          room: {
            include: {
              users: {
                select: this.userSelectFields,
              },
            },
          },
        },
      });
      return response.room;
    } catch (error) {
      throw new Error(`방 생성 실패: ${error.message}`);
    }
  }
  async enter(id, roomId) {
    try {
      const response = await this.prisma.user.update({
        where: { id },
        data: {
          room: { connect: { id: roomId } },
        },
        include: {
          room: {
            include: {
              users: {
                select: this.userSelectFields,
              },
            },
          },
        },
      });
      return response.room;
    } catch (error) {
      throw new Error(`방 입장 실패: ${error.message}`);
    }
  }
  async exit(id) {
    const response = await this.prisma.user.update({
      where: { id },
      data: {
        room: { disconnect: true },
      },
      include: {
        room: true,
      },
    });
    return response.room;
  }
  async getKeyboard(id) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: { keyboard: true, emoji: true },
    });
  }
  async updateScore(id, score) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        score: { increment: score },
      },
      select: {
        score: true,
      },
    });
  }
  async updateResult(data) {
    try {
      const result = {};
      await Promise.all(
        data.map(async (user) => {
          const updatedScore = await this.updateScore(
            user.userId,
            Math.ceil(user.score / 10),
          );
          result[user.id] = updatedScore.score;
        }),
      );
      return result;
    } catch (error) {
      throw new Error(`결과 업데이트 실패: ${error.message}`);
    }
  }
  async getItems(id) {
    return this.prisma.item.findMany({
      where: {
        user: {
          some: {
            userId: id,
          },
        },
      },
    });
  }
  async achieveItem(userId, itemId) {
    try {
      const existingItem = await this.prisma.userGetItem.count({
        where: { userId, itemId },
      });
      if (existingItem > 0) {
        return { success: false, message: '이미 보유한 아이템 입니다!' };
      }
      const newItem = await this.prisma.userGetItem.create({
        data: { userId, itemId },
      });
      return newItem
        ? { success: true, message: '획득 성공!' }
        : { success: false, message: '알 수 없는 이유로 실패' };
    } catch (error) {
      throw new Error(`아이템 획득 실패: ${error.message}`);
    }
  }
  async achieveAllItems(userId) {
    try {
      const allItems = await this.prisma.item.findMany({
        select: { id: true },
      });
      const userItems = await this.prisma.userGetItem.findMany({
        where: { userId },
        select: { itemId: true },
      });
      const userItemIds = userItems.map((item) => item.itemId);
      const itemsToAdd = allItems.filter(
        (item) => !userItemIds.includes(item.id),
      );
      const result = await this.prisma.userGetItem.createMany({
        data: itemsToAdd.map((item) => ({
          userId,
          itemId: item.id,
        })),
      });
      return {
        success: true,
        message: `${result.count}개의 새로운 아이템을 획득했습니다!`,
      };
    } catch (error) {
      throw new Error(`전체 아이템 획득 실패: ${error.message}`);
    }
  }
  async deleteGuest(id) {
    try {
      return this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new Error(`게스트 삭제 실패: ${error.message}`);
    }
  }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate(
  [
    (0, common_1.Injectable)(),
    __metadata('design:paramtypes', [
      prisma_service_1.PrismaService,
      wakgames_service_1.WakgamesService,
    ]),
  ],
  UserService,
);
//# sourceMappingURL=user.service.js.map
