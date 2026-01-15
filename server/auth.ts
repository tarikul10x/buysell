import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, Express } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from "./storage"; // Keep storage for DB operations, as used in routes.ts
import { db } from "./db"; // For direct DB access if needed, but primarily use storage

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// setupAuth: Set up authentication routes without Replit dependencies
export async function setupAuth(app: Express) {
  // Signup route (replaces Replit's /api/login and /api/callback)
  app.post('/api/auth/signup', async (req: Request, res: Response) => {
    try {
      const { username, email, first_name, last_name, profile_image_url, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const userData = {
        username,
        email,
        firstName: first_name,
        lastName: last_name,
        profileImageUrl: profile_image_url,
        password: hashedPassword, // Add password for local auth
      };
      const user = await storage.upsertUser(userData); // Use storage.upsertUser as in replitAuth.ts
      res.status(201).json({ message: 'User created', user });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Failed to signup' });
    }
  });

  // Login route
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      const userResult = await db.query.users.findFirst({ where: (users, { eq }) => eq(users.username, username) });
      if (!userResult) return res.status(401).json({ message: 'Invalid credentials' });

      const isValid = await bcrypt.compare(password, userResult.password);
      if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ userId: userResult.id, username: userResult.username }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token, user: userResult });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Failed to login' });
    }
  });

  // Logout route (client-side token removal)
  app.get('/api/logout', (req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully. Remove token from client.' });
  });
}

// isAuthenticated: JWT middleware (replaces Replit's isAuthenticated)
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string; username: string };
    req.user = { claims: { sub: decoded.userId }, username: decoded.username }; // Match replitAuth's req.user structure (claims.sub as userId)
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
}