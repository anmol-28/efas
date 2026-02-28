import { DataTypes, Model } from "sequelize";
import { getSequelize } from "../lib/sequelize.js";
export class RevokedToken extends Model {
}
RevokedToken.init({
    jti: {
        type: DataTypes.TEXT,
        allowNull: false,
        primaryKey: true,
        field: "jti"
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "expires_at"
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize: getSequelize(),
    tableName: "revoked_tokens",
    modelName: "RevokedToken",
    underscored: true,
    timestamps: false
});
