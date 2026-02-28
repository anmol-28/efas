import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { RevokedToken } from "../models/RevokedToken.js";
const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
const ACCESS_EXPIRES_IN = JWT_EXPIRES_IN;
const REFRESH_EXPIRES_IN = JWT_REFRESH_EXPIRES_IN;
function nowSeconds() {
    return Math.floor(Date.now() / 1000);
}
async function cleanupRevoked() {
    const now = new Date();
    await RevokedToken.destroy({ where: { expiresAt: { [Op.lt]: now } } });
}
export function signAccessToken(user) {
    const jti = crypto.randomUUID();
    return jwt.sign({ sub: String(user.id), email: user.email, typ: "access", jti }, JWT_SECRET, {
        expiresIn: ACCESS_EXPIRES_IN
    });
}
export function signRefreshToken(user) {
    const jti = crypto.randomUUID();
    return jwt.sign({ sub: String(user.id), email: user.email, typ: "refresh", jti }, JWT_SECRET, {
        expiresIn: REFRESH_EXPIRES_IN
    });
}
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
export async function isRevoked(payload) {
    if (!payload.jti)
        return false;
    await cleanupRevoked();
    const found = await RevokedToken.findByPk(payload.jti);
    return !!found;
}
export async function revokeToken(payload) {
    if (!payload.jti || !payload.exp)
        return;
    await RevokedToken.upsert({
        jti: payload.jti,
        expiresAt: new Date(payload.exp * 1000)
    });
}
export async function verifyAccessToken(token) {
    try {
        const payload = verifyToken(token);
        if (payload.typ !== "access")
            return null;
        if (await isRevoked(payload))
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
export async function verifyRefreshToken(token) {
    try {
        const payload = verifyToken(token);
        if (payload.typ !== "refresh")
            return null;
        if (await isRevoked(payload))
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
