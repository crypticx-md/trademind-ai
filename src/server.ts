import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import marketRoutes from "./api/routes/market.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/market", marketRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
====================================
🚀 TradeMind AI Backend Running
====================================
Server: http://localhost:${PORT}
====================================
`);
});