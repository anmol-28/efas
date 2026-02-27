import { DataTypes, Model, Optional } from "sequelize";
import { getSequelize } from "../lib/sequelize.js";

export interface AuditLogAttributes {
  id: string;
  userId: string | null;
  action: string;
  targetId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  success: boolean;
  createdAt: Date;
}

type AuditLogCreationAttributes = Optional<
  AuditLogAttributes,
  "id" | "createdAt" | "userId" | "targetId" | "ip" | "userAgent"
>;

export class AuditLog
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  declare id: string;
  declare userId: string | null;
  declare action: string;
  declare targetId?: string | null;
  declare ip?: string | null;
  declare userAgent?: string | null;
  declare success: boolean;
  declare createdAt: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: "id"
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "user_id"
    },
    action: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "action"
    },
    targetId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "target_id"
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "ip"
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "user_agent"
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "success"
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
    tableName: "audit_logs",
    modelName: "AuditLog",
    underscored: true,
    timestamps: false
  }
);
