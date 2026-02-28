import { DataTypes, Model, Optional } from "sequelize";
import { getSequelize } from "../lib/sequelize.js";

export interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  totpSecret: string;
  isActive: boolean;
  securityProfileEnabled: boolean;
  createdAt: Date;
}

type UserCreationAttributes = Optional<UserAttributes, "id" | "createdAt" | "securityProfileEnabled">;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare passwordHash: string;
  declare totpSecret: string;
  declare isActive: boolean;
  declare securityProfileEnabled: boolean;
  declare createdAt: Date;
}

User.init(
  {
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
  },
  {
    sequelize: getSequelize(),
    tableName: "users",
    modelName: "User",
    underscored: true,
    timestamps: false
  }
);
