import { DataTypes, Model } from "sequelize";
import { getSequelize } from "../lib/sequelize.js";
export class VaultEntry extends Model {
}
VaultEntry.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        field: "id"
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id"
    },
    platformName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "platform_name"
    },
    accountIdentifier: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "account_identifier"
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "description"
    },
    encAlgo: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "enc_algo",
        defaultValue: "AES-256-GCM"
    },
    encIv: {
        type: DataTypes.BLOB,
        allowNull: false,
        field: "enc_iv"
    },
    encTag: {
        type: DataTypes.BLOB,
        allowNull: false,
        field: "enc_tag"
    },
    encryptedPassword: {
        type: DataTypes.BLOB,
        allowNull: false,
        field: "encrypted_password"
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "updated_at",
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize: getSequelize(),
    tableName: "vault_entries",
    modelName: "VaultEntry",
    underscored: true,
    timestamps: false
});
