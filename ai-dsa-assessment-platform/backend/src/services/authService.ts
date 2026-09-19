import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User, IUser } from '../models/User';
import { createError } from '../middleware/errorHandler';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  college?: string;
  batch?: string;
  preferredLanguage?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateTokens(user: IUser): TokenPair {
  const payload = { id: user._id.toString(), email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

export async function registerUser(dto: RegisterDto): Promise<{ user: IUser; tokens: TokenPair }> {
  const existing = await User.findOne({ email: dto.email.toLowerCase() });
  if (existing) {
    throw createError('Email already registered', 409, 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(dto.password, config.bcryptRounds);

  const user = await User.create({
    name: dto.name,
    email: dto.email.toLowerCase(),
    passwordHash,
    college: dto.college,
    batch: dto.batch,
    preferredLanguage: dto.preferredLanguage || 'java',
    role: 'student',
  });

  const tokens = generateTokens(user);
  return { user, tokens };
}

export async function loginUser(dto: LoginDto): Promise<{ user: IUser; tokens: TokenPair }> {
  const user = await User.findOne({ email: dto.email.toLowerCase() });
  if (!user) {
    throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid) {
    throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const tokens = generateTokens(user);
  return { user, tokens };
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
      id: string;
      email: string;
      role: string;
    };
    const user = await User.findById(decoded.id);
    if (!user) {
      throw createError('User not found', 401, 'INVALID_TOKEN');
    }
    return generateTokens(user);
  } catch (err) {
    throw createError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
}

export async function getUserById(id: string): Promise<IUser> {
  const user = await User.findById(id).select('-passwordHash');
  if (!user) {
    throw createError('User not found', 404, 'USER_NOT_FOUND');
  }
  return user;
}
