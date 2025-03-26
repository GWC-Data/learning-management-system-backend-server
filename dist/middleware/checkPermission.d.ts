import { Request, Response, NextFunction } from 'express';
export declare const checkPermission: (requiredActions: string | string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
