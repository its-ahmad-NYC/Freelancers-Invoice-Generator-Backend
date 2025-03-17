const {Contract} = require("../models/index");
const {Client} = require("../models/index"); 
const PDFDocument = require("pdfkit"); 
const fs = require("fs");
const path = require("path");


exports.createContract = async (req, res) => {
  try {
    const { clientId, title, content, status } = req.body;
    const userId = req.user.userId;

    if (!clientId || !title || !content) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const contract = await Contract.create({ userId, clientId, title, content, status });

    res.status(201).json({ success: true, message: "Contract created successfully", data: contract });
  } catch (error) {
    console.error("Error creating contract:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


exports.getAllContracts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const contracts = await Contract.findAll({ where: { userId } });

    res.status(200).json({ success: true, data: contracts });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


exports.getContractById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const contract = await Contract.findOne({
            where: { id, userId },
            
            include: [{ model: Client, as: "client" }],
        });

        // console.log("Contract Details:", contract); 

        if (!contract) {
            return res.status(404).json({ success: false, message: "Contract not found" });
        }

        if (!contract.clientId) {  
            return res.status(400).json({ success: false, message: "Client is not associated to Contract!" });
        }

        res.status(200).json({ success: true, data: contract });
    } catch (error) {
        console.error("Error fetching contract:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


exports.getContractsByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;
    const userId = req.user.userId;

    const contracts = await Contract.findAll({ where: { clientId, userId },   include: [{ model: Client, as: "client" }], });

    if (!contracts.length) {
      return res.status(404).json({ success: false, message: "No contracts found for this client" });
    }

    res.status(200).json({ success: true, data: contracts });
  } catch (error) {
    console.error("Error fetching contracts by client ID:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


exports.updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { clientId, title, content, status } = req.body;

    if (!clientId || !title || !content) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const contract = await Contract.findOne({ where: { id, userId } });

    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }

    await contract.update({ clientId, title, content, status });

    res.status(200).json({ success: true, message: "Contract updated successfully", data: contract });
  } catch (error) {
    console.error("Error updating contract:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


exports.deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const contract = await Contract.findOne({ where: { id, userId } });

    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }

    await contract.destroy();
    res.status(200).json({ success: true, message: "Contract deleted successfully" });
  } catch (error) {
    console.error("Error deleting contract:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.downloadContractPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const contract = await Contract.findOne({
      where: { id, userId },
      include: [{ model: Client, as: "client" }],
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }

    if (!contract.client) {
      return res.status(400).json({ success: false, message: "Client not found for this contract" });
    }

  
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="contract_${id}.pdf"`);

    doc.pipe(res);

   
    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("Contract Agreement", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor("gray")
      .text(`Contract ID: ${id}`, { align: "center" })
      .fillColor("black")
      .moveDown(1);

   
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Contract Details", { underline: true })
      .moveDown();

    doc.font("Helvetica").fontSize(12);
    doc.text(`Title: ${contract.title}`).moveDown();
    doc.text(`Client: ${contract.client.name}`).moveDown();
    doc.text(`Status: ${contract.status}`).moveDown();
    
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

    
    doc.font("Helvetica-Bold").text("Content", { underline: true }).moveDown();
    doc.font("Helvetica").text(contract.content, { align: "justify" }).moveDown(1);

   
    doc.moveTo(50, 750).lineTo(550, 750).stroke();
    doc.fontSize(10).text("Generated by Company Name", 50, 760, { align: "center" });

  
    doc.end();
  } catch (error) {
    console.error("Error generating contract PDF:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};