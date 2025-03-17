const app = require("./app");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate(); 
    console.log("Database connection has been established successfully.");

    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully.");

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });

   
    process.on("SIGINT", async () => {
      console.log("Shutting down gracefully...");
      await sequelize.close();
      console.log("Database connection closed.");
      server.close(() => {
        console.log("Server stopped.");
        process.exit(0);
      });
    });

    process.on("SIGTERM", async () => {
      console.log("Process terminated.");
      await sequelize.close();
      server.close(() => process.exit(0));
    });

  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};

startServer();
