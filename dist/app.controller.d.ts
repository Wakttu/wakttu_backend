import { Request } from 'express';
import { AppService } from './app.service';
export declare class AppController {
  private readonly appService;
  constructor(appService: AppService);
  isLoggined(req: Request): any;
  getSession(req: Request): any;
  getAchieve(): Promise<
    {
      id: string;
      name: string;
      type: string;
      hint: string;
      author: string;
      desc: string;
      hidden: boolean;
      statId: string | null;
    }[]
  >;
}
