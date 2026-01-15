import { User } from '@shared/schema';

declare global {
  namespace Express {
    interface Request {
      user?: {
        claims: {
          sub: string;
        };
        username: string;
      };
    }
  }
}