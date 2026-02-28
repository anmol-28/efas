import { verifyAccessToken } from "../lib/jwt.js";
export async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.slice("Bearer ".length);
    const payload = await verifyAccessToken(token);
    if (!payload)
        return res.status(401).json({ error: "Unauthorized" });
    req.user = { id: payload.sub, email: payload.email, jti: payload.jti, exp: payload.exp, token };
    return next();
}
