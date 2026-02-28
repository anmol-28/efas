import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { requireAuth } from "../middleware/auth.js";
import { VaultEntry } from "../models/VaultEntry.js";
import { SecurityProfile } from "../models/SecurityProfile.js";
import { User } from "../models/User.js";
import { logAudit } from "../lib/audit.js";
const createSchema = z.object({
    platformName: z.string().min(1),
    accountIdentifier: z.string().min(1),
    password: z.string().min(1),
    description: z.string().optional(),
    userPassword: z.string().min(1)
});
const updateSchema = z.object({
    platformName: z.string().min(1).optional(),
    accountIdentifier: z.string().min(1).optional(),
    password: z.string().min(1).optional(),
    description: z.string().optional(),
    userPassword: z.string().min(1)
});
const revealSchema = z.object({
    answer1: z.string().min(1).optional(),
    answer2: z.string().min(1).optional(),
    answer3: z.string().min(1).optional(),
    userPassword: z.string().min(1)
});
function deriveKey(userPassword, userId) {
    const salt = Buffer.from(userId, "utf8");
    return crypto.scryptSync(userPassword, salt, 32);
}
function encryptPassword(plain, key) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return { iv, tag, encrypted };
}
function decryptPassword(encrypted, key, iv, tag) {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return plain.toString("utf8");
}
function toPublic(entry) {
    return {
        id: entry.id,
        platformName: entry.platformName,
        accountIdentifier: entry.accountIdentifier,
        description: entry.description,
        created_at: entry.createdAt,
        updated_at: entry.updatedAt
    };
}
const revealAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;
function checkRateLimit(userId) {
    const now = Date.now();
    const state = revealAttempts.get(userId);
    if (!state || now > state.resetAt) {
        revealAttempts.set(userId, { count: 1, resetAt: now + WINDOW_MS });
        return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
    }
    if (state.count >= MAX_ATTEMPTS) {
        return { allowed: false, remaining: 0, resetAt: state.resetAt };
    }
    state.count += 1;
    return { allowed: true, remaining: MAX_ATTEMPTS - state.count };
}
export const vaultRouter = Router();
vaultRouter.post("/", requireAuth, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized" });
    const parse = createSchema.safeParse(req.body);
    if (!parse.success) {
        await logAudit({ action: "VAULT_CREATE", success: false, req, userId: req.user.id });
        return res.status(400).json({ error: "Invalid payload" });
    }
    const { platformName, accountIdentifier, password, description, userPassword } = parse.data;
    const key = deriveKey(userPassword, req.user.id);
    const { iv, tag, encrypted } = encryptPassword(password, key);
    const now = new Date();
    const entry = await VaultEntry.create({
        userId: req.user.id,
        platformName,
        accountIdentifier,
        description: description ?? null,
        encAlgo: "AES-256-GCM",
        encIv: iv,
        encTag: tag,
        encryptedPassword: encrypted,
        createdAt: now,
        updatedAt: now
    });
    await logAudit({ action: "VAULT_CREATE", success: true, req, userId: req.user.id, targetId: entry.id });
    return res.status(201).json(toPublic(entry));
});
vaultRouter.get("/", requireAuth, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized" });
    const entries = await VaultEntry.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]]
    });
    return res.json(entries.map(toPublic));
});
vaultRouter.put("/:id", requireAuth, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized" });
    const parse = updateSchema.safeParse(req.body);
    if (!parse.success) {
        await logAudit({ action: "VAULT_UPDATE", success: false, req, userId: req.user.id, targetId: req.params.id });
        return res.status(400).json({ error: "Invalid payload" });
    }
    const entry = await VaultEntry.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!entry) {
        await logAudit({ action: "VAULT_UPDATE", success: false, req, userId: req.user.id, targetId: req.params.id });
        return res.status(404).json({ error: "Not found" });
    }
    const { platformName, accountIdentifier, password, description, userPassword } = parse.data;
    if (platformName !== undefined)
        entry.platformName = platformName;
    if (accountIdentifier !== undefined)
        entry.accountIdentifier = accountIdentifier;
    if (description !== undefined)
        entry.description = description;
    if (password !== undefined) {
        const key = deriveKey(userPassword, req.user.id);
        const { iv, tag, encrypted } = encryptPassword(password, key);
        entry.encAlgo = "AES-256-GCM";
        entry.encIv = iv;
        entry.encTag = tag;
        entry.encryptedPassword = encrypted;
    }
    entry.updatedAt = new Date();
    await entry.save();
    await logAudit({ action: "VAULT_UPDATE", success: true, req, userId: req.user.id, targetId: entry.id });
    return res.json(toPublic(entry));
});
vaultRouter.delete("/:id", requireAuth, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized" });
    const entry = await VaultEntry.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!entry) {
        await logAudit({ action: "VAULT_DELETE", success: false, req, userId: req.user.id, targetId: req.params.id });
        return res.status(404).json({ error: "Not found" });
    }
    await entry.destroy();
    await logAudit({ action: "VAULT_DELETE", success: true, req, userId: req.user.id, targetId: entry.id });
    return res.json({ ok: true });
});
vaultRouter.post("/:id/reveal", requireAuth, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized" });
    const rate = checkRateLimit(req.user.id);
    if (!rate.allowed) {
        await logAudit({ action: "VAULT_REVEAL", success: false, req, userId: req.user.id, targetId: req.params.id });
        return res.status(429).json({ error: "Too many attempts" });
    }
    const parse = revealSchema.safeParse(req.body);
    if (!parse.success) {
        await logAudit({ action: "VAULT_REVEAL", success: false, req, userId: req.user.id, targetId: req.params.id });
        return res.status(400).json({ error: "Invalid payload" });
    }
    const entry = await VaultEntry.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!entry) {
        await logAudit({ action: "VAULT_REVEAL", success: false, req, userId: req.user.id, targetId: req.params.id });
        return res.status(404).json({ error: "Not found" });
    }
    const user = await User.findByPk(req.user.id);
    const securityEnabled = user?.securityProfileEnabled ?? true;
    if (securityEnabled) {
        const profile = await SecurityProfile.findByPk(req.user.id);
        if (!profile) {
            await logAudit({ action: "VAULT_REVEAL", success: false, req, userId: req.user.id, targetId: req.params.id });
            return res.status(404).json({ error: "Security profile not configured" });
        }
        const { answer1, answer2, answer3 } = parse.data;
        if (!answer1 || !answer2 || !answer3) {
            await logAudit({ action: "VAULT_REVEAL", success: false, req, userId: req.user.id, targetId: req.params.id });
            return res.status(400).json({ error: "Invalid payload" });
        }
        const [ok1, ok2, ok3] = await Promise.all([
            bcrypt.compare(answer1, profile.answerOneHash),
            bcrypt.compare(answer2, profile.answerTwoHash),
            bcrypt.compare(answer3, profile.answerThreeHash)
        ]);
        const ok = ok1 && ok2 && ok3;
        if (!ok) {
            await logAudit({ action: "VAULT_REVEAL", success: false, req, userId: req.user.id, targetId: req.params.id });
            return res.status(401).json({ ok: false });
        }
    }
    const key = deriveKey(parse.data.userPassword, req.user.id);
    try {
        const password = decryptPassword(entry.encryptedPassword, key, entry.encIv, entry.encTag);
        await logAudit({ action: "VAULT_REVEAL", success: true, req, userId: req.user.id, targetId: entry.id });
        return res.json({ password });
    }
    catch {
        await logAudit({ action: "VAULT_REVEAL", success: false, req, userId: req.user.id, targetId: entry.id });
        return res.status(401).json({ error: "Invalid credentials" });
    }
});
