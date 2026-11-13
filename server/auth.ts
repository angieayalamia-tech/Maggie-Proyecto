import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

const FALLBACK_SECRET = crypto.createHash('sha256').update('maggie-sex-ed-local-key-2026').digest('hex');

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET !== 'CHANGE_ME_SESSION_SECRET'
    ? process.env.ADMIN_SESSION_SECRET
    : FALLBACK_SECRET;
}

export function getExpectedAdminPassword(storedHash?: string): { mode: 'env' | 'stored' | 'default'; value: string } {
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD !== 'CHANGE_ME_ADMIN_PASSWORD') {
    return { mode: 'env', value: process.env.ADMIN_PASSWORD };
  }
  if (storedHash) {
    return { mode: 'stored', value: storedHash };
  }
  return { mode: 'default', value: 'MaggieComite2026!' };
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyAdminPassword(candidate: string, storedHash?: string): boolean {
  const expected = getExpectedAdminPassword(storedHash);
  if (expected.mode === 'stored') {
    const [salt, keyHex] = expected.value.split(':');
    if (!salt || !keyHex) return false;
    const derived = crypto.scryptSync(candidate, salt, 32);
    const keyBuf = Buffer.from(keyHex, 'hex');
    if (derived.length !== keyBuf.length) return false;
    return crypto.timingSafeEqual(derived, keyBuf);
  }
  const candBuf = Buffer.from(candidate);
  const expBuf = Buffer.from(expected.value);
  if (candBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(candBuf, expBuf);
}

export function createAdminToken(emailOrRole: string): string {
  const payload = {
    sub: emailOrRole,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 12, // 12 hours
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSessionSecret()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyAdminToken(token: string): { sub: string; exp: number } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', getSessionSecret()).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
      sub: string;
      exp: number;
    };
    if (!decoded.exp || Date.now() > decoded.exp) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Se requiere autenticación administrativa.' });
    return;
  }
  const token = authHeader.slice(7).trim();
  const verified = verifyAdminToken(token);
  if (!verified) {
    res.status(401).json({ error: 'Sesión administrativa expirada o inválida.' });
    return;
  }
  next();
}
