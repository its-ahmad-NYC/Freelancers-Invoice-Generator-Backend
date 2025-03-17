const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Invoice = sequelize.define("Invoice", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { 
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'User', key: 'id' } 
  },
  clientId: { 
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Clients', key: 'id' } 
  },
  contractId:{
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Contracts', key: 'id' }
  },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  dueDate: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM("Paid", "Pending", "Overdue"), defaultValue: "Pending" },
});

module.exports = Invoice;
