const { Op } = require("sequelize");
const {Client} = require("../models/index");
const { Parser } = require("json2csv");

const validateClientData = (name, email) => {
  if (!name || name.trim().length < 3) return "Name must be at least 3 characters long";
  if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return "Invalid email format";
  return null;
};

exports.createClient = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user.userId;

    const validationError = validateClientData(name, email);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const existingClient = await Client.findOne({ where: { email, userId } });
    if (existingClient) return res.status(400).json({ success: false, message: "Client with this email already exists" });

    const newClient = await Client.create({ name, email, phone, userId });
    res.status(201).json({ success: true, message: "Client created successfully", client: newClient });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message, user: req.user });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const userId = req.user.userId;
    let { page, limit, search } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const searchCondition = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows: clients } = await Client.findAndCountAll({
      where: {
        userId,
        ...searchCondition,
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalClients: count,
      clients,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.exportClientsCSV = async (req, res) => {
    try {
      const userId = req.user.userId;
      
      console.log("User ID:", userId); 
  
      if (!userId || !/^[0-9a-fA-F-]{36}$/.test(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
      }
  
      const clients = await Client.findAll({
        where: { userId },
        attributes: ["name", "email"],
      });
  
      if (!clients.length) {
        return res.status(404).json({ success: false, message: "No clients found" });
      }
  
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(clients);
  
      res.setHeader("Content-Disposition", "attachment; filename=clients.csv");
      res.setHeader("Content-Type", "text/csv");
      res.status(200).send(csv);
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ success: false, message: "Server error", error: error, user: req.user });
    }
  };
  

exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const client = await Client.findOne({ where: { id, userId } });

    if (!client) return res.status(404).json({ success: false, message: "Client not found" });

    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const userId = req.user.userId;

    const client = await Client.findOne({ where: { id, userId } });

    if (!client) return res.status(404).json({ success: false, message: "Client not found" });

    
    const validationError = validateClientData(name || client.name, email || client.email);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    
    if (email && email !== client.email) {
      const emailExists = await Client.findOne({ where: { email, userId, id: { [Op.ne]: id } } });
      if (emailExists) return res.status(400).json({ success: false, message: "Client with this email already exists" });
    }

    // Update client
    client.name = name || client.name;
    client.email = email || client.email;
    await client.save();

    res.json({ success: true, message: "Client updated successfully", client });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const client = await Client.findOne({ where: { id, userId } });

    if (!client) return res.status(404).json({ success: false, message: "Client not found" });

    await client.destroy();

    res.json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
