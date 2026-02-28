import { DataTypes, Model } from "sequelize";
import { getSequelize } from "../lib/sequelize.js";
export class User extends Model {
}
User.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        field: "id"
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        field: "email"
    },
    passwordHash: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "password_hash"
    },
    totpSecret: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "totp_secret"
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: "is_active",
        defaultValue: true
    },
    securityProfileEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: "security_profile_enabled",
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize: getSequelize(),
    tableName: "users",
    modelName: "User",
    underscored: true,
    timestamps: false
});
