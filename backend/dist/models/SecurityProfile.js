import { DataTypes, Model } from "sequelize";
import { getSequelize } from "../lib/sequelize.js";
export class SecurityProfile extends Model {
}
SecurityProfile.init({
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
}, {
    sequelize: getSequelize(),
    tableName: "security_profile",
    modelName: "SecurityProfile",
    underscored: true,
    timestamps: false
});
