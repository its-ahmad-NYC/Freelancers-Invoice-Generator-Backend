const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Contract = sequelize.define(
  "Contract",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "User",
        key: "id",
      },
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Clients",
        key: "id",
      },
    },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM("Draft", "Signed", "Pending"), defaultValue: "Draft" },
  },
  {
    timestamps: true,
  }
);

module.exports = Contract;
