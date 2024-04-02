import { User } from './entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { WakgamesService } from 'src/wakgames/wakgames.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
  private readonly prisma;
  private readonly wakgamesService;
  constructor(prisma: PrismaService, wakgamesService: WakgamesService);
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  findById(id: string): Promise<{
    id: string;
    name: string;
    provider: string;
    score: number;
    password: string | null;
    keyboard: string[];
    character: import('@prisma/client/runtime/library').JsonValue;
    roomId: string | null;
  }>;
  findByName(name: string): Promise<{
    id: string;
    name: string;
    provider: string;
    score: number;
    keyboard: string[];
    character: import('@prisma/client/runtime/library').JsonValue;
    roomId: string | null;
  }>;
  private readonly userSelectFields;
  roomCreate(
    id: string,
    roomId: string,
  ): Promise<
    {
      users: {
        id: string;
        name: string;
        provider: string;
        score: number;
        keyboard: string[];
        character: import('@prisma/client/runtime/library').JsonValue;
      }[];
    } & {
      id: string;
      type: number;
      title: string;
      password: string | null;
      createdAt: Date;
      option: string[];
      start: boolean;
      updatedAt: Date;
      round: number;
      total: number;
      idx: number;
      time: number;
    }
  >;
  enter(
    id: string,
    roomId: string,
  ): Promise<
    {
      users: {
        id: string;
        name: string;
        provider: string;
        score: number;
        keyboard: string[];
        character: import('@prisma/client/runtime/library').JsonValue;
      }[];
    } & {
      id: string;
      type: number;
      title: string;
      password: string | null;
      createdAt: Date;
      option: string[];
      start: boolean;
      updatedAt: Date;
      round: number;
      total: number;
      idx: number;
      time: number;
    }
  >;
  exit(id: string): Promise<{
    id: string;
    type: number;
    title: string;
    password: string | null;
    createdAt: Date;
    option: string[];
    start: boolean;
    updatedAt: Date;
    round: number;
    total: number;
    idx: number;
    time: number;
  }>;
  getKeyboard(id: string): Promise<{
    emoji: {
      userId: string;
      createdAt: Date;
      emojiId: string;
    }[];
    keyboard: string[];
  }>;
  updateScore(
    id: string,
    score: number,
  ): Promise<{
    score: number;
  }>;
  updateResult(
    data: {
      id: string;
      score: number;
      userId: string;
      character: JSON;
      name: string;
    }[],
  ): Promise<{}>;
  getItems(id: string): Promise<
    {
      id: string;
      name: string;
      description: string | null;
      category: string;
      hint: string | null;
      author: string;
      url: string;
      achieveId: string[];
    }[]
  >;
  achieveItem(
    userId: string,
    itemId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }>;
  achieveAllItems(userId: string): Promise<{
    success: boolean;
    message: string;
  }>;
  deleteGuest(id: string): Promise<{
    id: string;
    name: string;
    provider: string;
    score: number;
    password: string | null;
    keyboard: string[];
    character: import('@prisma/client/runtime/library').JsonValue;
    roomId: string | null;
  }>;
}
