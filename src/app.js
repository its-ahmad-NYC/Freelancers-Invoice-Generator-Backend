require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const sequelize = require("./config/database");

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());




const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const clientRoutes = require("./routes/clientRoutes");

app.use("/api/clients", clientRoutes);

const contractRoutes = require("./routes/contractsRoute");

app.use("/api/contracts", contractRoutes);


app.get("/", (req, res) => res.send("Freelancer Invoice API is running"));

module.exports = app;


(async () => {
    try {
      await sequelize.authenticate(); 
      console.log("Database connected successfully.");
  
      // await sequelize.sync({ alter: true});

      // console.log("All models were synchronized successfully.");
    } catch (error) {
      console.error("Error syncing database:", error);
    }
  })();
  