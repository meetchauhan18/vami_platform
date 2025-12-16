import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}); 

    export default app;
