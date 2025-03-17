const express = require("express");
const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  exportClientsCSV, 
} = require("../controllers/clientController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createClient);
router.get("/", authMiddleware, getAllClients);
router.get("/export", authMiddleware, exportClientsCSV); 
router.get("/:id", authMiddleware, getClientById);
router.put("/:id", authMiddleware, updateClient);
router.delete("/:id", authMiddleware, deleteClient);



module.exports = router;
