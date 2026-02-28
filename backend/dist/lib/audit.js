import { AuditLog } from "../models/AuditLog.js";
export async function logAudit(params) {
    try {
        const ip = getIp(params.req);
        const userAgent = params.req?.headers["user-agent"] ?? null;
        await AuditLog.create({
            userId: params.userId ?? null,
            action: params.action,
            targetId: params.targetId ?? null,
            ip,
            userAgent,
            success: params.success,
            createdAt: new Date()
        });
    }
    catch {
        // swallow audit errors
    }
}
function getIp(req) {
    if (!req)
        return null;
    const xf = req.headers["x-forwarded-for"];
    if (typeof xf === "string" && xf.length > 0) {
        return xf.split(",")[0].trim();
    }
    return req.ip ?? null;
}
