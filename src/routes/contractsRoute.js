const express = require("express");
const {
  createContract,
  getAllContracts,
  getContractById,
  getContractsByClientId,
  updateContract,
  deleteContract,
  downloadContractPDF,
} = require("../controllers/contractController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/createContract", authMiddleware, createContract);
router.get("/getAllContracts", authMiddleware, getAllContracts);
router.get("/getContractbyId/:id", authMiddleware, getContractById);
router.get("/getContractbyClient/:clientId", authMiddleware, getContractsByClientId);
router.put("/updateContract/:id", authMiddleware, updateContract);
router.delete("/deleteContract/:id", authMiddleware, deleteContract);
router.get("/downloadContract/:id", authMiddleware, downloadContractPDF);

module.exports = router;
