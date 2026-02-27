import { DataTypes, Model } from "sequelize";
import { getSequelize } from "../lib/sequelize.js";

export interface SecurityProfileAttributes {
  userId: string;
  answerOneHash: string;
  answerTwoHash: string;
  answerThreeHash: string;
  createdAt?: Date;
}

export class SecurityProfile extends Model<SecurityProfileAttributes> implements SecurityProfileAttributes {
  declare userId: string;
  declare answerOneHash: string;
  declare answerTwoHash: string;
  declare answerThreeHash: string;
  declare createdAt?: Date;
}

SecurityProfile.init(
  {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      field: "user_id"
    },
    answerOneHash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "answer_one_hash"
    },
    answerTwoHash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "answer_two_hash"
    },
    answerThreeHash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "answer_three_hash"
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "created_at",
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize: getSequelize(),
    tableName: "security_profile",
    modelName: "SecurityProfile",
    underscored: true,
    timestamps: false
  }
);
