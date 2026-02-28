import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

type TokenType = "access" | "refresh";

export type JwtPayload = {
  sub: string;
  email: string;
  typ: TokenType;
  jti?: string;
  exp?: number;
};

const revoked = new Map<string, number>();

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function cleanupRevoked() {
  const now = nowSeconds();
  for (const [jti, exp] of revoked.entries()) {
    if (exp <= now) revoked.delete(jti);
  }
}

export function signAccessToken(user: { id: string; email: string }) {
  return jwt.sign(
    { sub: String(user.id), email: user.email, typ: "access" as const },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      jwtid: crypto.randomUUID()
    }
  );
}

export function signRefreshToken(user: { id: string; email: string }) {
  return jwt.sign(
    { sub: String(user.id), email: user.email, typ: "refresh" as const },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      jwtid: crypto.randomUUID()
    }
  );
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function isRevoked(payload: JwtPayload) {
  cleanupRevoked();
  if (!payload.jti) return false;
  const exp = revoked.get(payload.jti);
  if (!exp) return false;
  if (exp <= nowSeconds()) {
    revoked.delete(payload.jti);
    return false;
  }
  return true;
}

export function revokeToken(payload: JwtPayload) {
  if (!payload.jti || !payload.exp) return;
  revoked.set(payload.jti, payload.exp);
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const payload = verifyToken(token);
    if (payload.typ !== "access") return null;
    if (isRevoked(payload)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    const payload = verifyToken(token);
    if (payload.typ !== "refresh") return null;
    if (isRevoked(payload)) return null;
    return payload;
  } catch {
    return null;
  }
}
