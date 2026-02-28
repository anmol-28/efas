import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  const cookieToken = req.cookies?.efas_access;
  const token = bearerToken || cookieToken;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const payload = await verifyAccessToken(token);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  req.user = { id: payload.sub, email: payload.email, jti: payload.jti, exp: payload.exp, token };
  return next();
}
