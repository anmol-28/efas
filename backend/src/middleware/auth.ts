import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.slice("Bearer ".length);
  const payload = verifyAccessToken(token);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  req.user = { id: payload.sub, email: payload.email, jti: payload.jti, exp: payload.exp, token };
  return next();
}
