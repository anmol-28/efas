import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { requireAuth } from "../middleware/auth.js";
import { SecurityProfile } from "../models/SecurityProfile.js";
import { logAudit } from "../lib/audit.js";

const setupSchema = z.object({
  answer1: z.string().min(1),
  answer2: z.string().min(1),
  answer3: z.string().min(1)
});

const verifySchema = setupSchema;

export const securityProfileRouter = Router();

securityProfileRouter.get("/status", requireAuth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const existing = await SecurityProfile.findByPk(req.user.id);
  return res.json({ configured: !!existing });
});

securityProfileRouter.post("/setup", requireAuth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const parse = setupSchema.safeParse(req.body);
  if (!parse.success) {
    await logAudit({ action: "SECURITY_PROFILE_SETUP", success: false, req, userId: req.user.id });
    return res.status(400).json({ error: "Invalid payload" });
  }

  const existing = await SecurityProfile.findByPk(req.user.id);
  if (existing) {
    await logAudit({ action: "SECURITY_PROFILE_SETUP", success: false, req, userId: req.user.id });
    return res.status(409).json({ error: "Security profile already configured" });
  }

  const { answer1, answer2, answer3 } = parse.data;
  const [h1, h2, h3] = await Promise.all([
    bcrypt.hash(answer1, 10),
    bcrypt.hash(answer2, 10),
    bcrypt.hash(answer3, 10)
  ]);

  await SecurityProfile.create({
    userId: req.user.id,
    answerOneHash: h1,
    answerTwoHash: h2,
    answerThreeHash: h3
  });

  await logAudit({ action: "SECURITY_PROFILE_SETUP", success: true, req, userId: req.user.id });
  return res.json({ ok: true });
});

securityProfileRouter.post("/verify", requireAuth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const parse = verifySchema.safeParse(req.body);
  if (!parse.success) {
    await logAudit({ action: "SECURITY_PROFILE_VERIFY", success: false, req, userId: req.user.id });
    return res.status(400).json({ error: "Invalid payload" });
  }

  const profile = await SecurityProfile.findByPk(req.user.id);
  if (!profile) {
    await logAudit({ action: "SECURITY_PROFILE_VERIFY", success: false, req, userId: req.user.id });
    return res.status(404).json({ error: "Security profile not configured" });
  }

  const { answer1, answer2, answer3 } = parse.data;
  const [ok1, ok2, ok3] = await Promise.all([
    bcrypt.compare(answer1, profile.answerOneHash),
    bcrypt.compare(answer2, profile.answerTwoHash),
    bcrypt.compare(answer3, profile.answerThreeHash)
  ]);

  const ok = ok1 && ok2 && ok3;
  if (!ok) {
    await logAudit({ action: "SECURITY_PROFILE_VERIFY", success: false, req, userId: req.user.id });
    return res.status(401).json({ ok: false });
  }

  await logAudit({ action: "SECURITY_PROFILE_VERIFY", success: true, req, userId: req.user.id });
  return res.json({ ok: true });
});
