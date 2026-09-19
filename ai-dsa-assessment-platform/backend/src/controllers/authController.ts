import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, refreshAccessToken, getUserById } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, tokens } = await registerUser(req.body);
    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          batch: user.batch,
          preferredLanguage: user.preferredLanguage,
        },
        ...tokens,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, tokens } = await loginUser(req.body);
    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          batch: user.batch,
          preferredLanguage: user.preferredLanguage,
        },
        ...tokens,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    const tokens = await refreshAccessToken(refreshToken);
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getUserById(req.user!.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
