const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database"); 

const User = require("./User");
const Client = require("./Client");
const Contract = require("./Contract");
const Invoice = require("./Invoice");




User.hasMany(Client, { foreignKey: "userId", as: "clients" });
Client.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Contract, { foreignKey: "userId", as: "contracts" });
Contract.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Invoice, { foreignKey: "userId", as: "invoices" });
Invoice.belongsTo(User, { foreignKey: "userId", as: "user" });

Client.hasMany(Contract, { foreignKey: "clientId", as: "contracts" });
Contract.belongsTo(Client, { foreignKey: "clientId", as: "client" });

Client.hasMany(Invoice, { foreignKey: 'clientId', as: 'invoices' });
Invoice.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

module.exports = { sequelize, User, Client, Contract, Invoice };
