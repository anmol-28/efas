import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { authenticator } from "otplib";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit } from "../lib/audit.js";
import {
  revokeToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../lib/jwt.js";
import rateLimit from "express-rate-limit";

const refreshCookieName = "efas_refresh";
const refreshCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/auth"
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

const refreshLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totp: z.string().min(1)
});

function decryptSecret(totpSecret: string) {
  return totpSecret;
}

export const authRouter = Router();
authRouter.post("/login", loginLimiter, async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    await logAudit({ action: "AUTH_LOGIN", success: false, req });
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { email, password, totp } = parse.data;

  const user = await User.findOne({ where: { email } });
  if (!user || !user.isActive) {
    await logAudit({ action: "AUTH_LOGIN", success: false, req, userId: user?.id ?? null });
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    await logAudit({ action: "AUTH_LOGIN", success: false, req, userId: user.id });
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const secret = decryptSecret(user.totpSecret);
  const totpOk = authenticator.verify({ token: totp, secret });
  if (!totpOk) {
    await logAudit({ action: "AUTH_LOGIN", success: false, req, userId: user.id });
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = signAccessToken({ id: String(user.id), email: user.email });
  const refreshToken = signRefreshToken({ id: String(user.id), email: user.email });

  await logAudit({ action: "AUTH_LOGIN", success: true, req, userId: user.id });
  res.cookie(refreshCookieName, refreshToken, refreshCookieOptions);
  return res.json({ accessToken });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.json({ id: req.user.id, email: req.user.email });
});

authRouter.post("/refresh", refreshLimiter, async (req, res) => {
  const refreshToken = req.cookies?.[refreshCookieName];
  if (!refreshToken || typeof refreshToken !== "string") {
    await logAudit({ action: "AUTH_REFRESH", success: false, req });
    return res.status(400).json({ error: "Invalid payload" });
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    await logAudit({ action: "AUTH_REFRESH", success: false, req });
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await User.findByPk(payload.sub);
  if (!user || !user.isActive) {
    await logAudit({ action: "AUTH_REFRESH", success: false, req, userId: payload.sub });
    return res.status(401).json({ error: "Unauthorized" });
  }

  await revokeToken(payload);
  const accessToken = signAccessToken({ id: payload.sub, email: payload.email });
  const newRefreshToken = signRefreshToken({ id: payload.sub, email: payload.email });

  res.cookie(refreshCookieName, newRefreshToken, refreshCookieOptions);
  await logAudit({ action: "AUTH_REFRESH", success: true, req, userId: user.id });
  return res.json({ accessToken });
});

authRouter.post("/logout", requireAuth, async (req, res) => {
  const refreshToken = req.cookies?.[refreshCookieName];

  if (req.user?.jti && req.user.exp) {
    await revokeToken({
      sub: req.user.id,
      email: req.user.email,
      typ: "access",
      jti: req.user.jti,
      exp: req.user.exp
    });
  }

  if (refreshToken && typeof refreshToken === "string") {
    const payload = await verifyRefreshToken(refreshToken);
    if (payload) await revokeToken(payload);
  }

  await logAudit({ action: "AUTH_LOGOUT", success: true, req, userId: req.user?.id ?? null });
  res.clearCookie(refreshCookieName, refreshCookieOptions);
  return res.json({ ok: true });
});
