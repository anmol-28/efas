import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticator } from "otplib";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit } from "../lib/audit.js";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totp: z.string().min(1)
});

function decryptSecret(totpSecret: string) {
  return totpSecret;
}

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
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

  const token = jwt.sign({ sub: String(user.id), email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

  await logAudit({ action: "AUTH_LOGIN", success: true, req, userId: user.id });
  return res.json({ accessToken: token });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.json({ id: req.user.id, email: req.user.email });
});
