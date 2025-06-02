import express from "express";
import { startBot } from "src/bot";

const positionRoutes = express.Router();

// Middleware for logging requests to this router
positionRoutes.use((req, res, next) => {
  console.log(`User request received: ${req.method} ${req.originalUrl}`);
  next();
});

positionRoutes.post("/start", async (req, res, next) => {
  try {
    try {
      startBot(); // Start bot logic
      res.status(200).send("Bot started");
    } catch (error) {
      res.status(500).send("Error starting bot");
    }
  } catch (error) {
    next(error);
  }
});

// Stop the bot (you can stop the intervals, clear positions, etc.)
positionRoutes.post("/stop", (req, res) => {
  try {
    // Logic to stop the bot
    res.status(200).send("Bot stopped");
  } catch (error) {
    res.status(500).send("Error stopping bot");
  }
});

export default positionRoutes;
