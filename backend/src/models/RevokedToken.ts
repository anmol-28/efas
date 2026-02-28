import { DataTypes, Model, Optional } from "sequelize";
import { getSequelize } from "../lib/sequelize.js";

export interface RevokedTokenAttributes {
  jti: string;
  expiresAt: Date;
  createdAt: Date;
}

type RevokedTokenCreationAttributes = Optional<RevokedTokenAttributes, "createdAt">;

export class RevokedToken
  extends Model<RevokedTokenAttributes, RevokedTokenCreationAttributes>
  implements RevokedTokenAttributes
{
  declare jti: string;
  declare expiresAt: Date;
  declare createdAt: Date;
}

RevokedToken.init(
  {
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
  },
  {
    sequelize: getSequelize(),
    tableName: "revoked_tokens",
    modelName: "RevokedToken",
    underscored: true,
    timestamps: false
  }
);
