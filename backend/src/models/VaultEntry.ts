import { DataTypes, Model, Optional } from "sequelize";
import { getSequelize } from "../lib/sequelize.js";

export interface VaultEntryAttributes {
  id: string;
  userId: string;
  platformName: string;
  accountIdentifier: string;
  description?: string | null;
  encAlgo: string;
  encIv: Buffer;
  encTag: Buffer;
  encryptedPassword: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

type VaultEntryCreationAttributes = Optional<
  VaultEntryAttributes,
  "id" | "description" | "createdAt" | "updatedAt"
>;

export class VaultEntry
  extends Model<VaultEntryAttributes, VaultEntryCreationAttributes>
  implements VaultEntryAttributes
{
  declare id: string;
  declare userId: string;
  declare platformName: string;
  declare accountIdentifier: string;
  declare description?: string | null;
  declare encAlgo: string;
  declare encIv: Buffer;
  declare encTag: Buffer;
  declare encryptedPassword: Buffer;
  declare createdAt: Date;
  declare updatedAt: Date;
}

VaultEntry.init(
  {
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
  },
  {
    sequelize: getSequelize(),
    tableName: "vault_entries",
    modelName: "VaultEntry",
    underscored: true,
    timestamps: false
  }
);
